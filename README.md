# PKG-UP

A tool for @vercel/pkg with resedit support

## Installation

Install with npm

```bash
  npm install @tanishqmanuja/pkg-up

```

Install with yarn

```bash
  yarn add @tanishqmanuja/pkg-up

```

## Usage

- Init

  ```bash
  npx pkg-up init

  ```

  OR

  ```bash
  npx pkg-up i

  ```

- Build (default config is pkg.config.json)

  ```bash
  npx pkg-up build

  ```

  OR

  ```bash
  npx pkg-up b

  ```

- Build with config

  ```bash
  npx pkg-up build -c my.config.json

  ```

## Example with package.json scripts

```json
  "scripts": {
    "start": "node dist/index.js",
    "start:dev": "ts-node src/index.ts",
    "dev": "nodemon src/index/ts",
    "build": "rimraf dist && rollup -c rollup.config.js",
    "package": "npm run build && pkg-up b"
  },

```

## Sample Config File

```json
{
	"file": "dist/index.js",
	"icon": "app.ico",
	"name": "name",
	"description": "description",
	"company": "company",
	"version": "1.0.0",
	"copyright": "copyright",
	"pkg": {
		"targets": ["node16-win-x64"],
		"outputPath": "bin",
		"assets": [],
		"cache": ".pkg-cache",
		"compression": "gzip"
	}
}
```

compression and cache properties are optional
