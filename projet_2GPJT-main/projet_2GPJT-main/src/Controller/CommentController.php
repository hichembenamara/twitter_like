<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Form\CommentFormType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class CommentController extends AbstractController
{
    #[Route('/comment/{id}', name: 'comment_delete', methods: ['POST'])]
    public function delete(Comment $comment, EntityManagerInterface $entityManager, Request $request): Response
    {
        $params = ['slug' => $comment->getId()];
        if($this->isCsrfTokenValid('delete' . $comment->getId(), $request->request->get('_token'))) {
            $entityManager->remove($comment);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_feed', $params, Response::HTTP_SEE_OTHER);
    }

    #[Route('/comment/new', name: 'comment_new')]
    public function new(Comment $comment, EntityManagerInterface $entityManager, Request $request): Response
    {
        return $this->redirectToRoute('app_feed');
    }
}