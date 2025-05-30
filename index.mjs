#!/usr/bin/env node

import { homedir } from 'os'
import path from 'path'
import { select, input } from '@inquirer/prompts'
import 'zx/globals'

console.log(`\nmkrepo - spin up your next repo in seconds\n`)

const projectType = await select({
    message: 'Choose a project type:',
    choices: ['Next.js', 'Vite (React + TS)'],
})

const name = await input({ message: 'Project name:' })

if (projectType === 'Next.js') {
    await $({ stdio: 'inherit' })`npx create-next-app@latest ${name} --ts --eslint --use-npm --no-tailwind --app --no-src-dir --import-alias '@/*' --turbopack --no-interactive`
} else {
    await $`npm create vite@latest ${name} -- --template react-ts`
}

cd(name)

const templateDir = path.join(homedir(), 'dev-templates', projectType === 'Next.js' ? 'nextjs' : 'vite')

await $`cp ${path.join(homedir(), 'dev-templates', '.prettierrc.json')} .`
await Promise.all([
    $`cp ${path.join(templateDir, 'eslint.config.mjs')} .`,
    $`cp ${path.join(templateDir, 'tsconfig.json')} .`,
])
await $`npm install`
await $`git init`
await $`git add .`
await $`git commit -m "Initial commit via mkrepo"`
await $`npx prettier --write .`

await $`code .`
await snapWindow('left-half')

await $`open -a "Google Chrome" http://localhost:${projectType === 'Next.js' ? 3000 : 5173}`
await snapWindow('right-half')

async function snapWindow(position) {
    const isRectangleInstalled = await $`ls /Applications/Rectangle.app`.then(() => true).catch(() => false)

    if (isRectangleInstalled) {
        await $`open -g rectangle://execute-action?name=${position}`
    }
}