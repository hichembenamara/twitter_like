<?php

namespace App\Controller;

use App\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class LikeController extends AbstractController
{
    #[Route('/post/like/{id}', name: 'like_post')]
    public function like(Post $post, EntityManagerInterface $entityManager): Response
    {
        $user = $this->getUser();

        if($post->likedByUser($user)) {
            $post->removeLike($user);
            $entityManager->flush();
        } else {
            $post->addLike($user);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_feed', [], Response::HTTP_SEE_OTHER);
    }

    #[Route('/api/posts/{id}/like', name: 'api_like_post', methods: ['POST'])]
    public function apiLike(Post $post, EntityManagerInterface $entityManager): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        $user = $this->getUser();

        if($post->likedByUser($user)) {
            $post->removeLike($user);
            $entityManager->flush();
            $message = 'Post unliked';
        } else {
            $post->addLike($user);
            $entityManager->flush();
            $message = 'Post liked';
        }

        return $this->json(['message' => $message], Response::HTTP_OK);
    }
}