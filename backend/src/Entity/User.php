<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Vich\UploaderBundle\Mapping\Annotation as Vich;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\Ignore; // Keep if used, or remove if not
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_USERNAME', fields: ['username'])]
#[UniqueEntity(fields: ['email'], message: 'Impossible de crée le compte : cette email est déjà associé à un compte.')]
#[UniqueEntity(fields: ['username'], message: 'Ce nom d\'utilisateur est déjà pris.')]
#[Vich\Uploadable]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read', 'post:read', 'comment:read'])] // Added post:read and comment:read for context
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Groups(['user:read', 'post:read', 'comment:read'])]
    private ?string $email = null;

    #[ORM\Column(length: 100, unique: true)]
    #[Groups(['user:read', 'post:read', 'comment:read'])]
    #[Assert\NotBlank(message: "Le nom d'utilisateur ne peut pas être vide.")]
    #[Assert\Length(min: 3, max: 100, minMessage: "Le nom d'utilisateur doit faire au moins 3 caractères.", maxMessage: "Le nom d'utilisateur ne peut pas dépasser 100 caractères.")]
    // Regex to allow alphanumeric and underscores, common for usernames
    #[Assert\Regex(pattern: "/^[a-zA-Z0-9_]+$/", message: "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores (_).")]
    private ?string $username = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Groups(['user:read'])]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    // Password should generally not be serialized
    private ?string $password = null;

    #[ORM\Column(length: 200)]
    #[Groups(['user:read', 'post:read', 'comment:read'])]
    #[Assert\NotBlank(message: "Le nom d'affichage ne peut pas être vide.")]
    private ?string $nom = null;

    #[ORM\Column(length: 200)]
    #[Groups(['user:read', 'post:read', 'comment:read'])] // Path to image file or name
    private ?string $imageFile = null;

    #[ORM\Column(type: 'string', nullable:true)]
    #[Groups(['user:read', 'post:read', 'comment:read'])] // Actual image name if different
    private ?string $imageName = null;

    #[ORM\Column(nullable:true)]
    #[Groups(['user:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $bio = null;

    #[ORM\Column(type: Types::BOOLEAN, nullable: true)]
    #[Groups(['user:read'])]
    private ?bool $profil_public = null;

    /**
     * @var Collection<int, Post>
     */
    #[ORM\OneToMany(targetEntity: Post::class, mappedBy: 'user_created')]
    private Collection $posts;

    /**
     * @var Collection<int, Post>
     */
    #[ORM\ManyToMany(targetEntity: Post::class, mappedBy: 'likes')]
    private Collection $user_post_likes;

    public function __construct()
    {
        $this->posts = new ArrayCollection();
        $this->user_post_likes = new ArrayCollection();
    }

    /**
     * @var Collection<int, Post>
     */

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    /**
     * @see UserInterface
     *
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(string $bio): static
    {
        $this->bio = $bio;

        return $this;
    }

    public function isProfilPublic(): ?bool
    {
        return $this->profil_public;
    }

    public function setProfilPublic(bool $profil_public): self
    {
        $this->profil_public = $profil_public;

        return $this;
    }

    /**
     * @return Collection<int, Post>
     */
    public function getPosts(): Collection
    {
        return $this->posts;
    }

    public function addPost(Post $post): static
    {
        if (!$this->posts->contains($post)) {
            $this->posts->add($post);
            $post->setUserCreated($this);
        }

        return $this;
    }

    public function removePost(Post $post): static
    {
        if ($this->posts->removeElement($post)) {
            // set the owning side to null (unless already changed)
            if ($post->getUserCreated() === $this) {
                $post->setUserCreated(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Post>
     */
    public function getUserPostLikes(): Collection
    {
        return $this->user_post_likes;
    }

    public function addUserPostLike(Post $userPostLike): static
    {
        if (!$this->user_post_likes->contains($userPostLike)) {
            $this->user_post_likes->add($userPostLike);
            $userPostLike->addLike($this);
        }

        return $this;
    }

    public function removeUserPostLike(Post $userPostLike): static
    {
        if ($this->user_post_likes->removeElement($userPostLike)) {
            $userPostLike->removeLike($this);
        }

        return $this;
    }

    /**
     * If manually uploading a file (i.e. not using Symfony Form) ensure an instance
     * of 'UploadedFile' is injected into this setter to trigger the update. If this
     * bundle's configuration parameter 'inject_on_load' is set to 'true' this setter
     * must be able to accept an instance of 'File' as the bundle will inject one here
     * during Doctrine hydration.
     *
     * @param File|\Symfony\Component\HttpFoundation\File\UploadedFile|null $imageFile
     */

    public function setImageName(?string $imageName): void
    {
        $this->imageName = $imageName;
    }

    public function getImageName(): ?string
    {
        return $this->imageName;
    }

    /**
     * Get the value of updatedAt
     */
    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    /**
     * Set the value of updatedAt
     */
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * Get the value of imageFile
     */
    public function getImageFile(): ?string
    {
        return $this->imageFile;
    }

    /**
     * Set the value of imageFile
     */
    public function setImageFile(?string $imageFile): self
    {
        $this->imageFile = $imageFile;

        return $this;
    }

}