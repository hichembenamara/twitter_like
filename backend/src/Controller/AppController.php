<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class AppController extends AbstractController
{
    #[Route('/index', name: 'app_index')]
    public function index(): Response
    {

        return $this->render('app/index.html.twig', [
            'controller_name' => 'AppController',
        ]);
    }
}
