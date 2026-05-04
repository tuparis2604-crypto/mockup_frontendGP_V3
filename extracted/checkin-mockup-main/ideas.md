# Brainstorm de Design - Check-in Contínuo

## Contexto
Plataforma B2B corporativa para check-in contínuo e desenvolvimento de pessoas. Necessidade: profissional, limpo, moderno, sem excesso de informação. Usuários: geridos, gestores, RH, sócios.

---

## Abordagem 1: Minimalismo Corporativo Contemporâneo (Probabilidade: 0.08)

**Design Movement:** Minimalismo corporativo com influências de design de sistemas modernos (IBM Carbon, Stripe)

**Core Principles:**
- Espaço em branco estratégico como elemento estrutural
- Hierarquia clara através de tipografia e peso visual
- Cores neutras com um único acento suave (azul-acinzentado)
- Funcionalidade acima de ornamentação

**Color Philosophy:**
- Fundo: Branco puro (#FFFFFF)
- Texto primário: Cinza escuro (#1F2937)
- Texto secundário: Cinza médio (#6B7280)
- Acento: Azul-acinzentado (#4B5563) para CTAs e highlights
- Bordas: Cinza muito claro (#E5E7EB)
- Lógica: Neutralidade absoluta transmite profissionalismo; o azul-acinzentado é sofisticado sem ser vibrante

**Layout Paradigm:**
- Sidebar esquerda fixa com ícones + labels (não apenas ícones)
- Conteúdo principal com grid de 12 colunas
- Máxima largura de 1400px para legibilidade
- Padding generoso (32px+) entre seções

**Signature Elements:**
1. Cards com borda sutil (1px #E5E7EB) e sombra mínima (0 1px 3px rgba)
2. Ícones de linha fina (stroke 1.5px) em azul-acinzentado
3. Divisores horizontais em vez de cards para listas (mais ar)

**Interaction Philosophy:**
- Hover: Fundo muito claro (#F9FAFB) em elementos interativos
- Transições suaves (200ms) sem easing exagerado
- Feedback visual imediato mas discreto

**Animation:**
- Fade-in ao carregar conteúdo (300ms, ease-out)
- Slide suave de painéis laterais (250ms)
- Hover: Mudança de cor + leve elevação (0 4px 6px rgba)

**Typography System:**
- Display: "Poppins" 700, 32px (títulos de página)
- Heading: "Poppins" 600, 20px (títulos de seção)
- Body: "Inter" 400, 14px (conteúdo)
- Label: "Inter" 500, 12px (labels de campos)
- Ratio: 1.5 entre linhas para legibilidade corporativa

---

## Abordagem 2: Design Humanista com Profundidade (Probabilidade: 0.07)

**Design Movement:** Humanismo digital com elementos de glassmorphism suave (Figma, Notion)

**Core Principles:**
- Profundidade através de camadas e sombras suaves
- Tipografia com personalidade (fonte display moderna)
- Cores quentes neutras (bege, cinza azulado)
- Micro-interações que transmitem feedback humano

**Color Philosophy:**
- Fundo: Bege muito claro (#FAFAF8)
- Texto primário: Cinza escuro com tom quente (#2D2D2D)
- Texto secundário: Cinza médio (#7A7A7A)
- Acento: Teal suave (#5EAAA8)
- Bordas: Cinza claro com transparência (#D0D0D0 a 40%)
- Lógica: Tons quentes criam sensação de proximidade; teal transmite confiança e crescimento

**Layout Paradigm:**
- Sidebar com fundo ligeiramente mais escuro (glassmorphism)
- Cards com sombra em camadas (0 4px 12px rgba + 0 1px 3px rgba)
- Espaçamento irregular (24px, 32px, 48px) para ritmo visual
- Conteúdo em "ilhas" visuais separadas

**Signature Elements:**
1. Cards com fundo semi-transparente e backdrop blur
2. Ícones com preenchimento suave (não apenas linha)
3. Badges com fundo teal claro e texto teal escuro

**Interaction Philosophy:**
- Hover: Elevação visível + mudança de sombra
- Clique: Feedback tátil visual (scale 0.98)
- Transições com easing personalizado (cubic-bezier)

**Animation:**
- Bounce suave em entrada de elementos (300ms, cubic-bezier(0.34, 1.56, 0.64, 1))
- Hover: Scale 1.02 + sombra aumentada (200ms)
- Transição entre páginas: Fade + slide suave (350ms)

**Typography System:**
- Display: "Outfit" 700, 36px (títulos)
- Heading: "Outfit" 600, 22px (subtítulos)
- Body: "Inter" 400, 15px (conteúdo)
- Label: "Inter" 500, 13px (labels)
- Ratio: 1.6 entre linhas para respiração visual

---

## Abordagem 3: Modernismo Corporativo com Acentos Vibrantes (Probabilidade: 0.06)

**Design Movement:** Modernismo corporativo com influências de design de startups B2B (Slack, Monday.com)

**Core Principles:**
- Estrutura geométrica clara com ângulos e linhas
- Contraste entre elementos neutros e um acento vibrante
- Tipografia ousada em hierarquias
- Uso estratégico de cor para guiar atenção

**Color Philosophy:**
- Fundo: Branco (#FFFFFF)
- Texto primário: Cinza muito escuro (#0F172A)
- Texto secundário: Cinza médio (#64748B)
- Acento primário: Índigo vibrante (#4F46E5)
- Acento secundário: Âmbar suave (#F59E0B) para alertas/ações
- Lógica: Índigo transmite inovação e confiança; âmbar cria urgência sem ser agressivo

**Layout Paradigm:**
- Sidebar com fundo cinza muito claro (#F8FAFC)
- Cards com borda esquerda colorida (4px #4F46E5)
- Grid assimétrico com destaque para elementos importantes
- Linhas divisórias diagonais em seções especiais

**Signature Elements:**
1. Cards com borda esquerda colorida e ícone no topo
2. Badges com fundo índigo claro e texto índigo escuro
3. Botões com preenchimento índigo + hover com sombra colorida

**Interaction Philosophy:**
- Hover: Borda esquerda mais espessa + fundo claro
- Clique: Feedback com cor (flash de índigo)
- Transições com momentum (easing ease-out)

**Animation:**
- Entrada: Slide da esquerda + fade (300ms)
- Hover: Borda esquerda expande (200ms) + sombra colorida
- Transição entre páginas: Fade com rotação suave (300ms)

**Typography System:**
- Display: "Sora" 700, 34px (títulos de página)
- Heading: "Sora" 600, 20px (títulos de seção)
- Body: "Inter" 400, 14px (conteúdo)
- Label: "Inter" 600, 12px (labels com peso)
- Ratio: 1.5 entre linhas

---

## Decisão Final

**Abordagem Escolhida: Minimalismo Corporativo Contemporâneo (Abordagem 1)**

Esta abordagem foi selecionada porque:
- Alinha perfeitamente com requisitos de "profissional, limpo, corporativo moderno"
- Espaço em branco estratégico facilita leitura de dados (importante para dashboards)
- Azul-acinzentado é sofisticado sem distrair do conteúdo
- Escalabilidade: funciona bem para múltiplos perfis de usuário sem parecer confuso
- Acessibilidade: contraste adequado, tipografia legível, sem excesso de animações

**Paleta de Cores Final:**
- Branco: #FFFFFF
- Cinza escuro: #1F2937
- Cinza médio: #6B7280
- Cinza claro: #E5E7EB
- Cinza muito claro: #F9FAFB
- Acento: #4B5563 (azul-acinzentado)
- Sucesso: #10B981
- Alerta: #F59E0B
- Erro: #EF4444

**Tipografia Final:**
- Display: Poppins 700
- Heading: Poppins 600
- Body: Inter 400
- Label: Inter 500

**Componentes Signature:**
- Cards com borda 1px e sombra mínima
- Ícones de linha fina
- Divisores sutis em listas
- Transições suaves 200-300ms
