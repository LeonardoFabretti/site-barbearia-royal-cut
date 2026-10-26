-- Dados de exemplo: um profissional, o horário de trabalho e os serviços.
-- Rode depois de estrutura.sql.

insert into profissionais (nome) values ('Leonardo');

-- terça (2) a sábado (6), das 9h às 19h, com almoço das 12h às 13h
insert into expediente (profissional_id, dia_semana, inicio, fim)
select p.id, d.dia, h.inicio, h.fim
from profissionais p
cross join (values (2), (3), (4), (5), (6)) as d(dia)
cross join (values (time '09:00', time '12:00'), (time '13:00', time '19:00')) as h(inicio, fim)
where p.nome = 'Leonardo';

insert into servicos (nome, preco, duracao_min, categoria) values
  -- barbearia
  ('Corte masculino', 40, 30, 'masculino'),
  ('Corte e barba', 50, 60, 'masculino'),
  ('Barba', 30, 30, 'masculino'),
  -- espaço feminino
  ('Corte feminino', 70, 60, 'feminino'),
  ('Corte + escova', 100, 90, 'feminino'),
  ('Escova', 60, 60, 'feminino'),
  ('Hidratação', 60, 60, 'feminino'),
  ('Reconstrução', 70, 60, 'feminino'),
  ('Coloração completa', 150, 120, 'feminino'),
  ('Pintura de raiz', 100, 90, 'feminino'),
  ('Tonalização', 90, 60, 'feminino'),
  ('Mechas', 300, 180, 'feminino'),
  ('Luzes', 280, 180, 'feminino'),
  ('Morena iluminada', 350, 240, 'feminino'),
  ('Progressiva', 250, 180, 'feminino'),
  ('Selagem', 220, 150, 'feminino'),
  ('Penteado', 150, 60, 'feminino'),
  ('Penteado de noiva', 350, 120, 'feminino');
