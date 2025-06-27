<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\UserFormType;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;

final class UserController extends AbstractController
{
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function getCurrentUser(Security $security, SerializerInterface $serializer): JsonResponse
    {
        $user = $security->getUser();

        if (!$user) {
            return $this->json(['message' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Ensure the user entity is used, not just a UserInterface proxy if it's simple
        if (!$user instanceof \App\Entity\User) {
             // This case should ideally not happen if proper user loading is configured
            return $this->json(['message' => 'User data not available'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json($user, Response::HTTP_OK, [], ['groups' => 'user:read']);
    }

    #[Route('/api/users', name: 'api_users_list', methods: ['GET'])]
    public function getAllUsers(UserRepository $userRepository): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        $users = $userRepository->findAll();
        
        return $this->json($users, Response::HTTP_OK, [], ['groups' => 'user:read']);
    }

    #[Route('/api/users/{id}/follow', name: 'api_user_follow', methods: ['POST'])]
    public function followUser(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        $currentUser = $this->getUser();
        $userToFollow = $userRepository->find($id);
        
        if (!$userToFollow) {
            return $this->json(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
        }
        
        if ($currentUser === $userToFollow) {
            return $this->json(['message' => 'Cannot follow yourself'], Response::HTTP_BAD_REQUEST);
        }
        
        // Add to following list
        if (!$currentUser->getFollowing()->contains($userToFollow)) {
            $currentUser->addFollowing($userToFollow);
            $entityManager->flush();
        }
        
        return $this->json(['message' => 'User followed successfully'], Response::HTTP_OK);
    }

    #[Route('/api/users/{id}/unfollow', name: 'api_user_unfollow', methods: ['POST'])]
    public function unfollowUser(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        $currentUser = $this->getUser();
        $userToUnfollow = $userRepository->find($id);
        
        if (!$userToUnfollow) {
            return $this->json(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
        }
        
        // Remove from following list
        if ($currentUser->getFollowing()->contains($userToUnfollow)) {
            $currentUser->removeFollowing($userToUnfollow);
            $entityManager->flush();
        }
        
        return $this->json(['message' => 'User unfollowed successfully'], Response::HTTP_OK);
    }

    #[Route('/api/friends', name: 'api_friends_list', methods: ['GET'])]
    public function getFriends(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        $currentUser = $this->getUser();
        $friends = $currentUser->getFollowing();
        
        return $this->json($friends, Response::HTTP_OK, [], ['groups' => 'user:read']);
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function apiLogout(): JsonResponse
    {
        return $this->json(['message' => 'Logged out successfully'], Response::HTTP_OK);
    }
    #[Route('/profil/my', name: 'app_user')]
    public function index(Security $security): Response
    {
        $user = $security->getUser();

        return $this->render('user/index.html.twig', [
            'user' => $user,
        ]);
    }

    #[Route('/profil/{id}', name: 'user_profil')]
    public function profil($id, UserRepository $userRepository, PostRepository $postRepository): Response
    {
        $profil = $userRepository->find($id);
        $user_created_id = $userRepository->find($id);
        $user_connected = $this->getUser();
        $post = $postRepository->mesPosts($user_created_id);

        return $this->render('user/profil.html.twig', [
            'user'=> $profil,
            'post'=> $post,
        ]);
    }

    #[Route('/profil/my/edit', name: 'app_user_edit', methods: ['GET', 'POST'])]
    public function edit(\Symfony\Component\HttpFoundation\Request $request, EntityManagerInterface $entityManager, Security $security, SluggerInterface $slugger, #[Autowire('images/user')] string $imagesDirectory): Response
    {
        $user = $security->getUser();

        $form = $this->createForm(UserFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $imageFile = $form->get('imageFile')->getData();
            if ($imageFile) {
                $originalFilename = pathinfo($imageFile->getClientOriginalName(), PATHINFO_FILENAME);
                // this is needed to safely include the file name as part of the URL
                $safeFilename = $slugger->slug($originalFilename);
                $newFilename = $safeFilename.'-'.uniqid().'.'.$imageFile->guessExtension();

                // Move the file to the directory where brochures are stored
                try {
                    $imageFile->move($imagesDirectory, $newFilename);
                } catch (FileException $e) {
                    // ... handle exception if something happens during file upload
                }

                // updates the 'brochureFilename' property to store the PDF file name
                // instead of its contents
                $user->setImageFile($newFilename);
            }

            $entityManager->persist($user);
            $entityManager->flush();

            return $this->redirectToRoute('app_user', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('user/edit.html.twig', [
            'user' => $user,
            'form' => $form->createView(),
        ]);
    }
}