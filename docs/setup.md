# Setup & Installation

XeoContext is best run using **Docker**. The image serves the application statically and expects your documentation content to be mounted as a volume. This enables a "Docs-as-Code" workflow where you can update your markdown or specs, and the viewer reflects changes immediately (upon refresh).

## Prerequisites

- [Docker](https://www.docker.com/) installed on your machine.
- A directory containing your documentation (Markdown, OpenAPI, AsyncAPI).

## Running with Docker Compose (Recommended)

The easiest way to run XeoContext is using `docker-compose`. This allows you to define your volume mounts cleanly.

1.  **Create your project structure** (see [Project Structure](./structure.md)).
2.  **Create a `docker-compose.yml` file**:

```yaml
version: '3.8'

services:
  xeocontext:
    image: ghcr.io/xeost/xeocontext:latest # Or build locally
    container_name: my-system-docs
    ports:
      - "3000:80"
    volumes:
      # Mount the configuration file (REQUIRED)
      - ./xeocontext.config.json:/usr/share/nginx/html/content/xeocontext.config.json
      
      # Mount your content directories
      - ./system-design:/usr/share/nginx/html/content/system-design
      - ./openapi:/usr/share/nginx/html/content/openapi
      - ./asyncapi:/usr/share/nginx/html/content/asyncapi
    restart: unless-stopped
```

3.  **Run the service**:
    ```bash
    docker-compose up -d
    ```

4.  **Access the docs**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running with Docker CLI

You can also run it with a single command:

```bash
docker run -d \
  -p 3000:80 \
  -v $(pwd)/xeocontext.config.json:/usr/share/nginx/html/content/xeocontext.config.json \
  -v $(pwd)/system-design:/usr/share/nginx/html/content/system-design \
  -v $(pwd)/openapi:/usr/share/nginx/html/content/openapi \
  -v $(pwd)/asyncapi:/usr/share/nginx/html/content/asyncapi \
  xeocontext:latest
```

## Building Locally

If you want to modify the customized UI or build the image yourself:

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Run development server:
    ```bash
    pnpm dev
    ```
    *Note: In dev mode, content is served from `content`. You may need to update files there to see changes.*

4.  Build the Docker image:
    ```bash
    docker build -t xeocontext:local .
    ```
