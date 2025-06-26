<?php

namespace App\Entity;

use App\Repository\CommentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CommentRepository::class)]
class Comment {

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['comment:read', 'post:read'])] // Added post:read for context if Comment is part of Post
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['comment:read', 'post:read'])]
    private ?string $Contenu = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['comment:read', 'post:read'])]
    private ?\DateTimeInterface $creation = null;

    #[ORM\ManyToOne(cascade: ['persist'])]
    #[Groups(['comment:read', 'post:read'])] // This will use 'user:read' on User entity
    private ?User $user_created = null;

    #[ORM\ManyToOne(inversedBy: 'comment')]
    // Avoid serializing back to Post from Comment if Post includes Comments, to prevent circular refs.
    // If needed, a less detailed 'post:summary' group could be used here.
    // For now, not including $post in 'comment:read' to keep it simple.
    // If $post is included when a Comment is part of a Post's serialization, it can lead to deep objects or loops.
    private ?Post $post = null;

    public function getId(): ?int
    {
        return $this->id;
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
        return $this->creation;
    }

    public function setCreation(?\DateTimeInterface $Creation): static
    {
        $this->creation = $Creation;

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

    public function getPost(): ?Post
    {
        return $this->post;
    }

    public function setPost(?Post $post): static
    {
        $this->post = $post;

        return $this;
    }
}