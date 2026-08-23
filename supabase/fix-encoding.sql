-- Corrige a corrupção de acentos/emoji (tagline e cover_emoji ficaram
-- de fora da primeira correção). Roda uma vez, só isso.

update public.products set
  title = 'Bolsa Tote Crochê',
  tagline = 'Verão 25',
  cover_emoji = '🧶',
  short_description = 'Bolsa tote feita à mão em crochê, algodão 100% natural.',
  description = 'Peça feita à mão em crochê, com fio 100% algodão natural. Estrutura firme para o dia a dia, alças reforçadas e acabamento artesanal em cada carreira de pontos.'
where slug = 'bolsa-tote-croche';

update public.products set
  title = 'Vestido Linho Crochê',
  tagline = 'Sob Medida',
  cover_emoji = '🌿',
  short_description = 'Vestido em linho com detalhes em crochê, sob medida.',
  description = 'Vestido construído sob medida a partir das suas medidas — tecido de linho leve combinado com painéis de crochê feitos à mão.'
where slug = 'vestido-linho-croche';

update public.products set
  title = 'Top Rendado Natural',
  tagline = 'Edição Limitada',
  cover_emoji = '🤍',
  short_description = 'Top rendado em crochê, edição limitada.',
  description = 'Top com renda de crochê trabalhada à mão, em edição limitada — poucas peças por lote.'
where slug = 'top-rendado-natural';

update public.products set
  title = 'Crochê para Iniciantes',
  tagline = 'Curso Online',
  cover_emoji = '🧵',
  short_description = 'Aprenda os pontos base do crochê e crie sua primeira peça.',
  description = 'Curso gravado, para assistir quando quiser: do ponto baixo ao ponto alto, leitura de gráficos e o passo a passo completo para criar sua primeira peça em crochê.'
where slug = 'curso-croche-iniciantes';
