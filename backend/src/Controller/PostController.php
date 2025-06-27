<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Post;
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
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

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

    #[Route('/api/posts', name: 'api_posts_list', methods: ['GET'])]
    public function apiGetPosts(PostRepository $postRepository): JsonResponse
    {
        // Ensure user is authenticated (this should be handled by firewall access_control)
        // $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY'); // Or appropriate role

        // Fetch posts, ordered by creation date descending for a typical feed
        // Add pagination later if needed (e.g., $request->query->getInt('page', 1))
        $posts = $postRepository->findBy([], ['Creation' => 'DESC']);

        // Return JSON response using serialization groups
        // The 'post:read' group on Post entity will trigger 'user:read' on User and 'comment:read' on Comment
        return $this->json($posts, Response::HTTP_OK, [], ['groups' => 'post:read']);
    }

    #[Route('/api/posts', name: 'api_posts_create', methods: ['POST'])]
    public function apiCreatePost(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_USER'); // Ensure user is authenticated

        try {
            $data = json_decode($request->getContent(), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return $this->json(['message' => 'Invalid JSON payload: ' . json_last_error_msg()], Response::HTTP_BAD_REQUEST);
            }

            $constraints = new Assert\Collection([
                'content' => [new Assert\NotBlank()], // Maps to Post->Contenu
                'image' => [new Assert\Optional([new Assert\Url()])], // Maps to Post->Media
                // 'titre' is not sent from frontend's current addTweet, make it optional or derive
            ]);

            $violations = $validator->validate($data, $constraints);
            if (count($violations) > 0) {
                $errors = [];
                foreach ($violations as $violation) {
                    $errors[preg_replace('/[\[\]]/', '', $violation->getPropertyPath())] = $violation->getMessage();
                }
                return $this->json(['errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $user = $this->getUser();
            if (!$user instanceof \App\Entity\User) {
                // This should not happen if denyAccessUnlessGranted ROLE_USER passes
                return $this->json(['message' => 'User not authenticated or not found.'], Response::HTTP_UNAUTHORIZED);
            }

            $post = new Post();
            $post->setUserCreated($user);
            $post->setContenu($data['content']);

            // Handle Titre: either make it optional in Post entity, or derive/require it
            // For now, let's derive a short title. Max 50 chars for Post->Titre.
            $titre = substr($data['content'], 0, 45);
            if (strlen($data['content']) > 45) {
                $titre .= '...';
            }
            $post->setTitre($titre);

            if (!empty($data['image'])) {
                $post->setMedia($data['image']);
            }
            $post->setCreation(new \DateTime());

            // Validate the Post entity itself (e.g., length constraints if any)
            $entityViolations = $validator->validate($post);
            if (count($entityViolations) > 0) {
                $errors = [];
                foreach ($entityViolations as $violation) {
                    $errors[$violation->getPropertyPath()] = $violation->getMessage();
                }
                return $this->json(['errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $entityManager->persist($post);
            $entityManager->flush();

            return $this->json($post, Response::HTTP_CREATED, [], ['groups' => 'post:read']);

        } catch (\Exception $e) {
            // Log $e->getMessage(), $e->getTraceAsString()
            return $this->json(['message' => 'An error occurred while creating the post.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}