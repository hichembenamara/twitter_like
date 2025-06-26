<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Post;
use App\Entity\Produit;
use App\Form\CommentFormType;
use App\Form\PostFormType;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class PostController extends AbstractController
{
    private $security;

    public function __construct(Security $security)
    {
        $this->security = $security;
    }

    #[Route('/feed', name: 'app_feed')]
    public function index(Request $request, EntityManagerInterface $entityManager, PostRepository $postRepository, UserRepository $userRepository, int $user_created = null): Response
    {
        $user_created_id = $this->security->getUser()->getId();
        $post = $postRepository->Posts($user_created_id);

        $comment = new Comment();
        $form = $this->createForm(CommentFormType::class, $comment);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
          $comment->setUserCreated($this->security->getUser());
          $comment->setCreation(new \DateTime('now'));
          $entityManager->persist($comment);
          $entityManager->flush();
        }

        return $this->render('post/feed.html.twig', [
            'post' => $post,
            'usercreatedid' => $user_created_id,
            'form' => $form->createView()
        ]);
    }

    #[Route('/feed/show/{id}', name: 'app_post_show', methods: ['GET', 'POST'])]
    public function show(Request $request, int $id, EntityManagerInterface $entityManager, Post $post, int $user_created = null): Response
    {
        $user_created_id = $this->security->getUser()->getId();

        $comment = new Comment();
        $form = $this->createForm(CommentFormType::class, $comment);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $comment->setUserCreated($this->security->getUser());
            $comment->setCreation(new \DateTime('now'));
            $comment->setPost($post);
            $entityManager->persist($comment);
            $entityManager->flush();

            return $this->redirectToRoute('app_post_show', ['id' => $post->getId()]);
        }

        return $this->render('post/show.html.twig', [
            'post' => $post,
            'usercreatedid' => $user_created_id,
            'form' => $form->createView()
        ]);
    }


    #[Route('/feed/newPost', name: 'app_post_new', methods: ['GET', 'POST'])]
    public function new(\Symfony\Component\HttpFoundation\Request $request, EntityManagerInterface $entityManager): Response
    {
        $post = new Post();
        $form = $this->createForm(PostFormType::class, $post);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $post->setUserCreated($this->security->getUser());
            $post->setCreation(new \DateTime('now'));
            $entityManager->persist($post);
            $entityManager->flush();

            return $this->redirectToRoute('app_feed', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('post/new.html.twig', [
            'post' => $post,
            'form' => $form->createView(),
        ]);
    }

    #[Route('/feed/post_edit_{id}', name: 'app_post_edit', methods: ['GET', 'POST'])]
    public function edit(\Symfony\Component\HttpFoundation\Request $request, Post $post, EntityManagerInterface $entityManager): Response
    {
        if ($post->getUserCreated() !== $this->security->getUser()) {
            throw $this->createAccessDeniedException("Vous n'êtes pas autorisé à effectué cette action.");
        }

        $form = $this->createForm(PostFormType::class, $post);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_feed', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('post/edit.html.twig', [
            'controller_name' => 'PostController',
            'post' => $post,
            'form' => $form->createView(),
        ]);
    }

    #[Route('/feed/post/delete/{id}', name: 'app_post_delete', methods: ['GET', 'POST'])]
    public function delete(\Symfony\Component\HttpFoundation\Request $request, Post $post, EntityManagerInterface $entityManager): Response
    {
        if ($post->getUserCreated() !== $this->security->getUser()) {
            throw $this->createAccessDeniedException("Vous n'êtes pas autorisé à effectué cette action.");
        }

        $entityManager->remove($post);
        $entityManager->flush();

        return $this->redirectToRoute('app_feed', [], Response::HTTP_SEE_OTHER);
    }

    #[Route('/myposts', name: 'app_myposts')]
    public function myposts(Security $security, PostRepository $postRepository, UserRepository $userRepository): Response
    {
        $user_created_id = $this->security->getUser();
        $post = $postRepository->mesPosts($user_created_id);

        return $this->render('post/view_posts.html.twig', [
            'controller_name' => 'FeedController',
            'post' => $post,
        ]);
    }
}