<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250428092650 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comment DROP INDEX UNIQ_9474526CF987D8A8, ADD INDEX IDX_9474526CF987D8A8 (user_created_id)');
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526CF987D8A8');
        $this->addSql('ALTER TABLE comment ADD CONSTRAINT FK_9474526CF987D8A8 FOREIGN KEY (user_created_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comment DROP INDEX IDX_9474526CF987D8A8, ADD UNIQUE INDEX UNIQ_9474526CF987D8A8 (user_created_id)');
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526CF987D8A8');
        $this->addSql('ALTER TABLE comment ADD CONSTRAINT FK_9474526CF987D8A8 FOREIGN KEY (user_created_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE SET NULL');
    }
}
