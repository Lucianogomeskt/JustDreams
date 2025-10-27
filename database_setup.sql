-- =====================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - JUST DREAMS
-- =====================================================
-- Este arquivo contém todos os comandos SQL necessários
-- para criar o banco de dados do projeto Just Dreams
-- 
-- INSTRUÇÕES DE USO:
-- 1. Execute este script no MySQL/MariaDB
-- 2. Certifique-se de que o usuário tem permissões de CREATE
-- 3. O banco será criado com o nome 'justdreams'
-- 4. Todas as tabelas e relacionamentos serão configurados
-- =====================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS justdreams 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE justdreams;

-- =====================================================
-- TABELA: PROFESSORES
-- =====================================================
CREATE TABLE IF NOT EXISTS professores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo ENUM('professor') NOT NULL DEFAULT 'professor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_professores_email (email),
    INDEX idx_professores_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: TURMAS
-- =====================================================
CREATE TABLE IF NOT EXISTS turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_turmas_codigo (codigo),
    INDEX idx_turmas_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: ALUNOS
-- =====================================================
CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    idade INT NOT NULL,
    turma VARCHAR(50) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo ENUM('aluno') NOT NULL DEFAULT 'aluno',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_alunos_nome (nome),
    INDEX idx_alunos_turma (turma),
    INDEX idx_alunos_tipo (tipo),
    
    -- Constraints
    CONSTRAINT chk_alunos_idade CHECK (idade >= 5 AND idade <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: AMIZADES
-- =====================================================
CREATE TABLE IF NOT EXISTS amizades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alunoId INT NOT NULL,
    amigoId INT NOT NULL,
    status ENUM('pendente', 'aceito', 'recusado') NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_amizades_aluno (alunoId),
    INDEX idx_amizades_amigo (amigoId),
    INDEX idx_amizades_status (status),
    
    -- Constraints
    UNIQUE KEY unique_amizade (alunoId, amigoId),
    FOREIGN KEY fk_amizades_aluno (alunoId) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY fk_amizades_amigo (amigoId) REFERENCES alunos(id) ON DELETE CASCADE,
    CONSTRAINT chk_amizades_diferentes CHECK (alunoId != amigoId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DADOS INICIAIS PARA TESTE
-- =====================================================
-- Inserir alguns alunos de teste
INSERT INTO alunos (nome, idade, turma, senha_hash, tipo) VALUES
('João Silva', 10, '5º Ano A', 'senha_hash_exemplo', 'aluno'),
('Maria Santos', 11, '5º Ano B', 'senha_hash_exemplo', 'aluno'),
('Pedro Oliveira', 10, '5º Ano A', 'senha_hash_exemplo', 'aluno');



