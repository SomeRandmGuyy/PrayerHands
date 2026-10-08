# Docker Containers

Each folder here contains a Dockerfile, and a config.sh describing how to build
the images and where to push them. These images are built and pushed in GitHub Actions
by the `ghcr.yml` workflow.

## Building Manually

```bash
docker build -f containers/app/Dockerfile -t openhands .
docker build -f containers/sandbox/Dockerfile -t sandbox .
```

## Gentle Fist Machine

`containers/machine/Dockerfile` is the agent's internal execution machine: a shell, git, Python, Node.js, and a workspace at `/workspace`. The app's default sandbox image is `gentlefist/machine:latest`.

Build from the repository root:

```bash
docker build -f containers/machine/Dockerfile -t gentlefist/machine:latest .
```

Skip the project dependency install when you only need a shell and workspace:

```bash
docker build -f containers/machine/Dockerfile \
  --build-arg INSTALL_RUNTIME=0 \
  -t gentlefist/machine:latest .
```

Run:

```bash
docker run --rm -it --user gentlefist \
  -v "$PWD":/workspace -w /workspace \
  gentlefist/machine:latest
```

The image does not install a Docker daemon and does not expect the host Docker socket. The action execution server is what Gentle Fist starts inside the container. For an operator shell, pass `--user gentlefist`.
