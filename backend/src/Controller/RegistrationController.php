<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert; // For manual validation

class RegistrationController extends AbstractController
{
    #[Route('/register', name: 'app_register')]
    public function register(Request $request, UserPasswordHasherInterface $userPasswordHasher, EntityManagerInterface $entityManager): Response
    {
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var string $plainPassword */
            $plainPassword = $form->get('plainPassword')->getData();

            // encode the plain password
            $user->setPassword($userPasswordHasher->hashPassword($user, $plainPassword));

            $entityManager->persist($user);
            $entityManager->flush();

            return $this->redirectToRoute('app_login');
        }

        return $this->render('registration/register.html.twig', [
            'registrationForm' => $form
        ]);
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function apiRegister(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        ValidatorInterface $validator
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return $this->json(['message' => 'Invalid JSON payload: ' . json_last_error_msg()], Response::HTTP_BAD_REQUEST);
            }

            // Basic validation for required fields
            // More complex validation can be done via constraints on a DTO or directly on the entity
            $constraints = new Assert\Collection([
                'email' => [new Assert\NotBlank(), new Assert\Email()],
                'password' => [new Assert\NotBlank(), new Assert\Length(['min' => 6])],
                'displayName' => [new Assert\NotBlank()], // Maps to 'nom'
                'username' => [ // Add validation rules for username based on User entity constraints
                    new Assert\NotBlank(),
                    new Assert\Length(['min' => 3, 'max' => 100]),
                    new Assert\Regex(pattern: "/^[a-zA-Z0-9_]+$/")
                ],
            ]);

            $violations = $validator->validate($data, $constraints);

            if (count($violations) > 0) {
                $errors = [];
                foreach ($violations as $violation) {
                    $errors[preg_replace('/[\[\]]/', '', $violation->getPropertyPath())] = $violation->getMessage();
                }
                return $this->json(['errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            // Check if email already exists (though UniqueEntity constraint will also catch this at flush)
            $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
            if ($existingUser) {
                return $this->json(['message' => 'Email already in use.'], Response::HTTP_CONFLICT);
            }

            $user = new User();
            $user->setEmail($data['email']);
            $user->setUsername($data['username']); // Set username
            $user->setNom($data['displayName']); // Map displayName to nom
            $user->setPassword($passwordHasher->hashPassword($user, $data['password']));
            $user->setRoles(['ROLE_USER']); // Default role

            // Additional validation on the User entity itself (e.g. UniqueEntity for email and username)
            // This will be caught by Doctrine if not validated explicitly before persist/flush
            $entityViolations = $validator->validate($user);
            if (count($entityViolations) > 0) {
                 $errors = [];
                foreach ($entityViolations as $violation) {
                    $errors[$violation->getPropertyPath()] = $violation->getMessage();
                }
                return $this->json(['errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $entityManager->persist($user);
            $entityManager->flush();

            // Return the created user, using serialization groups
            // Ensure your User entity has appropriate #[Groups] annotations
            return $this->json($user, Response::HTTP_CREATED, [], ['groups' => 'user:read']);

        } catch (\Exception $e) {
            // Log the exception $e->getMessage(), $e->getTraceAsString() etc.
            return $this->json(['message' => 'An error occurred during registration.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}