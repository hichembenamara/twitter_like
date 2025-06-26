<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250421102623 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8D8B179085');
        $this->addSql('DROP INDEX IDX_5A8A6C8D8B179085 ON post');
        $this->addSql('ALTER TABLE post CHANGE user_created_id_id user_created_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8DF987D8A8 FOREIGN KEY (user_created_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_5A8A6C8DF987D8A8 ON post (user_created_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8DF987D8A8');
        $this->addSql('DROP INDEX IDX_5A8A6C8DF987D8A8 ON post');
        $this->addSql('ALTER TABLE post CHANGE user_created_id user_created_id_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8D8B179085 FOREIGN KEY (user_created_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_5A8A6C8D8B179085 ON post (user_created_id_id)');
    }
}
