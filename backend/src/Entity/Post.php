<?php

namespace App\Entity;

use App\Repository\PostRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PostRepository::class)]
class Post
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['post:read', 'comment:read'])] // Added comment:read for context if Post is part of Comment
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups(['post:read'])]
    private ?string $Titre = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['post:read'])]
    private ?string $Contenu = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['post:read'])]
    private ?\DateTimeInterface $Creation = null;

    #[ORM\ManyToOne(inversedBy: 'posts')]
    #[Groups(['post:read'])] // This will use the 'user:read' group on the User entity
    private ?User $user_created = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitre(): ?string
    {
        return $this->Titre;
    }

    public function setTitre(string $Titre): static
    {
        $this->Titre = $Titre;

        return $this;
    }

    public function getContenu(): ?string
    {
        return $this->Contenu;
    }

    public function setContenu(string $Contenu): static
    {
        $this->Contenu = $Contenu;

        return $this;
    }

    public function getCreation(): ?\DateTimeInterface
    {
        return $this->Creation;
    }

    public function setCreation(?\DateTimeInterface $Creation): static
    {
        $this->Creation = $Creation;

        return $this;
    }

    public function getUserCreated(): ?User
    {
        return $this->user_created;
    }

    public function setUserCreated(?User $user_created): static
    {
        $this->user_created = $user_created;

        return $this;
    }

    // This $author property seems redundant if $user_created is the actual author.
    // If it's different, it needs groups too. For now, assuming $user_created is the one.
    private $author;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['post:read'])]
    private ?string $Media = null;

    /**
     * @var Collection<int, Comment>
     */
    #[ORM\OneToMany(targetEntity: Comment::class, mappedBy: 'post')]
    #[Groups(['post:read'])] // This will use 'comment:read' on Comment entity
    private Collection $comment;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'user_post_likes')]
    #[ORM\JoinTable('post_user_like')]
    #[Groups(['post:read'])] // This will serialize a list of users who liked the post, using 'user:read'
    private Collection $likes;

    public function __construct()
    {
        $this->comment = new ArrayCollection();
        $this->likes = new ArrayCollection();
    }

    // This getter seems to be for the redundant $author property
    public function getAuthor(): ?User
    {
        return $this->author;
    }

    // This setter seems to be for the redundant $author property
    public function setAuthor(?User $author): self
    {
        $this->author = $author;
        return $this;
    }

    public function getMedia(): ?string
    {
        return $this->Media;
    }

    public function setMedia(?string $Media): static
    {
        $this->Media = $Media;

        return $this;
    }

    /**
     * @return Collection<int, Comment>
     */
    public function getComment(): Collection
    {
        return $this->comment;
    }

    public function addComment(Comment $comment): static
    {
        if (!$this->comment->contains($comment)) {
            $this->comment->add($comment);
            $comment->setPost($this);
        }

        return $this;
    }

    public function removeComment(Comment $comment): static
    {
        if ($this->comment->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getPost() === $this) {
                $comment->setPost(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getLikes(): Collection
    {
        return $this->likes;
    }

    public function addLike(User $like): static
    {
        if (!$this->likes->contains($like)) {
            $this->likes->add($like);
        }

        return $this;
    }

    public function removeLike(User $like): static
    {
        $this->likes->removeElement($like);

        return $this;
    }

    public function likedByUser(User $user): bool
    {
        return $this->likes->contains($user);
    }
}