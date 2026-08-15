# 🎯 Combo Hunter

Um jogo de adivinhação de números feito em HTML, CSS e JavaScript puro. Acerte o número escondido antes de esgotar as tentativas e encadeie acertos rápidos para acender o combo e multiplicar sua pontuação.

## Como jogar

1. Abra o `index.html` no navegador.
2. Digite um palpite dentro do intervalo mostrado e clique em **Chutar**.
3. Use as dicas de temperatura (🔥 quente, ❄️ frio) e a direção (maior/menor) para se aproximar do número secreto.
4. Acerte em até 6 tentativas para avançar de nível. Errar todas as tentativas custa uma vida.
5. O jogo termina quando as vidas acabam. Seu recorde fica salvo no navegador.

## Rodando localmente

Não há dependências nem build — basta abrir o arquivo `index.html` diretamente no navegador, ou servir a pasta com qualquer servidor estático:

```bash
npx serve .
```

## Estrutura

- `index.html` — marcação e estrutura da interface do jogo.
- `style.css` — estilos e tema visual.
- `script.js` — lógica do jogo (rodadas, pontuação, combo, níveis e persistência do recorde).
