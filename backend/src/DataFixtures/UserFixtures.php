<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        // Créer des utilisateurs de test
        $testUsers = [
            [
                'email' => 'alice@test.com',
                'username' => 'alice_dev',
                'nom' => 'Alice Martin',
                'bio' => 'Développeuse frontend passionnée par React et TypeScript ⚛️',
                'password' => 'password123'
            ],
            [
                'email' => 'bob@test.com',
                'username' => 'bob_designer',
                'nom' => 'Bob Wilson',
                'bio' => 'Designer UI/UX créatif. J\'aime créer de belles expériences utilisateur 🎨',
                'password' => 'password123'
            ],
            [
                'email' => 'charlie@test.com',
                'username' => 'charlie_tech',
                'nom' => 'Charlie Dubois',
                'bio' => 'Ingénieur full-stack et contributeur open source. Addict au café ☕',
                'password' => 'password123'
            ],
            [
                'email' => 'diana@test.com',
                'username' => 'diana_writer',
                'nom' => 'Diana Lopez',
                'bio' => 'Rédactrice de contenu et storyteller. Passionnée de littérature 📚',
                'password' => 'password123'
            ],
            [
                'email' => 'eve@test.com',
                'username' => 'eve_data',
                'nom' => 'Eve Chen',
                'bio' => 'Data scientist et amatrice de machine learning. Toujours curieuse 🤖',
                'password' => 'password123'
            ]
        ];

        foreach ($testUsers as $userData) {
            $user = new User();
            $user->setEmail($userData['email']);
            $user->setUsername($userData['username']);
            $user->setNom($userData['nom']);
            $user->setBio($userData['bio']);
            $user->setRoles(['ROLE_USER']);
            
            // Hacher le mot de passe
            $hashedPassword = $this->passwordHasher->hashPassword($user, $userData['password']);
            $user->setPassword($hashedPassword);
            
            // Définir des images par défaut (optionnel)
            $user->setImageFile(null); // Sera null par défaut
            $user->setImageName(null);
            
            $manager->persist($user);
        }

        $manager->flush();
    }
}