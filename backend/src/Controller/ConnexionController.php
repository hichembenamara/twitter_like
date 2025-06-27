<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class ConnexionController extends AbstractController
{
    #[Route(path: '/login', name: 'app_login')]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();

        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('connexion/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error,
        ]);
    }

    #[Route(path: '/logout', name: 'app_logout')]
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
    
    #[Route(path: '/api/login_success', name: 'api_login_success')]
    public function apiLoginSuccess(): JsonResponse
    {
        return new JsonResponse(['status' => 'success', 'message' => 'Login successful']);
    }
    
    #[Route(path: '/api/login_failure', name: 'api_login_failure')]  
    public function apiLoginFailure(): JsonResponse
    {
        return new JsonResponse(['status' => 'error', 'message' => 'Authentication failed'], 401);
    }
    
    #[Route(path: '/api/login_check', name: 'api_login_check', methods: ['POST'])]
    public function apiLoginCheck(): JsonResponse
    {
        // This route should never be reached as it's handled by security
        throw new \Exception('This should not be reached');
    }
    
    #[Route(path: '/api/me', name: 'api_me', methods: ['GET'])]
    public function apiMe(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['message' => 'User not authenticated'], 401);
        }
        
        // Return user data using serialization groups
        return $this->json($user, 200, [], ['groups' => 'user:read']);
    }
}
