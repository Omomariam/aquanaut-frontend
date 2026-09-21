# Publish your website

1. In Studio, connect GitHub and export the frontend. Choose Public for the simplest GitHub Pages setup.
2. Open the new repository → Settings → Secrets and variables → Actions → Variables → New repository variable.
3. Name it TOKEN_CA, paste your real token contract/mint address into Value, then click Add variable. Leave it blank until your token launches.
4. Go to Settings → Pages → Source and choose GitHub Actions.
5. Go to Actions → Publish website → Run workflow. Open the website link when it finishes.

Changing a variable? Run Publish website again. These values are public.

## Local or ZIP setup

1. Edit the public values in config.js, or copy .env.example to .env and run node --env-file=.env scripts/configure.mjs with Node 22+.
2. Serve this directory using a static web server.
