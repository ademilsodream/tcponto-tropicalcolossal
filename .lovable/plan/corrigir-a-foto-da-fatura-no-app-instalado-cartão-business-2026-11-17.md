# Corrigir a foto da fatura no app instalado (Cartão Business)

## O que está a acontecer
No telemóvel, quando a câmara abre, o Android fecha o TCPonto em segundo plano para libertar memória (a foto em alta resolução é pesada). Ao voltar da câmara, o app recomeça do zero — por isso parece só um "refresh" e a foto perde-se. No navegador isso não acontece, por isso o teste anterior passava.

## O que vou mudar
1. **Foto mais leve logo na câmara**: pedir ao telemóvel a foto já reduzida (cerca de 1600 px, qualidade 70). Fica nítida para ler a fatura e gasta muito menos memória, o que evita que o Android feche o app na maioria dos casos.
2. **Recuperar a foto se o app reiniciar mesmo assim**: quando o app volta da câmara depois de ter sido fechado, apanha a foto que ficou pendente, abre o Cartão Business sozinho e continua a leitura (fornecedor, nº, data, valor, obra).
3. **Lembrar que estava no Cartão Business**: antes de abrir a câmara, o app guarda que estava nesse ecrã, para voltar a ele em vez de ir para o início.
4. **Mensagem clara em caso de falha**: se a leitura falhar, aparece o motivo em vez de não acontecer nada.

Nada muda no ponto, cálculos, créditos do cartão, Drive ou regras das faturas.

## Importante
Como isto mexe na parte nativa do app, depois de aprovado é preciso **gerar e instalar uma nova versão do APK** (git pull, `npm install`, `npm run build`, `npx cap sync android` e compilar no Android Studio).

## Detalhes técnicos
- `src/utils/nativeCamera.ts`: `Camera.getPhoto` com `quality: 70`, `width: 1600`, `resultType: Uri`, `saveToGallery: false`.
- Instalar `@capacitor/app`; no arranque, registar `App.addListener('appRestoredResult', ...)` — se `pluginId === 'Camera'` e `success`, converter `data.webPath` em File e entregá-lo ao BusinessCard (via store/evento global, guardando a imagem pendente em sessionStorage/IndexedDB até o ecrã montar).
- Antes de `getPhoto`, gravar `localStorage.pendingRoute = '/business-card'`; no arranque, se houver resultado pendente, navegar para essa rota.
- `compressImage`: libertar o canvas e usar `createImageBitmap` quando disponível para reduzir picos de memória.
- Opcional no `AndroidManifest.xml`: `android:largeHeap="true"` na `<application>`.
