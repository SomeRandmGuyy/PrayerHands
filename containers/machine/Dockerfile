# Gentle Fist Machine
#
# Internal execution environment for the Gentle Fist agent: a shell, git,
# Python, Node.js, and a workspace at /workspace. The application launches
# this image as the sandbox (see SANDBOX_RUNTIME_CONTAINER_IMAGE).
#
# Build from the repository root:
#   docker build -f containers/machine/Dockerfile -t gentlefist/machine:latest .
#
# Interactive shell:
#   docker run --rm -it -v "$PWD":/workspace -w /workspace gentlefist/machine:latest
#
# The full target installs the project runtime dependencies so the action
# execution server can start. Set INSTALL_RUNTIME=0 to build only the
# shell/workspace layer:
#   docker build -f containers/machine/Dockerfile --build-arg INSTALL_RUNTIME=0 \
#     -t gentlefist/machine:latest .

FROM python:3.12-slim-bookworm

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1 \
    PYTHONPATH=/openhands/code \
    WORKSPACE=/workspace

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        bash \
        build-essential \
        ca-certificates \
        curl \
        git \
        jq \
        nodejs \
        npm \
        procps \
        sudo \
        tini \
        tmux \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Workspace account. UID 1000 matches the runtime client's default user id.
# `openhands` is a second name for that account because the runtime client
# still passes --username openhands. Passwordless sudo is limited to this
# account so the agent can install packages inside the machine. The image
# does not mount the Docker socket and does not install a Docker daemon.
ARG MACHINE_UID=1000
ARG MACHINE_GID=1000
RUN groupadd --gid "${MACHINE_GID}" gentlefist \
    && useradd --uid "${MACHINE_UID}" --gid "${MACHINE_GID}" --create-home --shell /bin/bash gentlefist \
    && useradd --uid "${MACHINE_UID}" --gid "${MACHINE_GID}" --non-unique --no-create-home --shell /bin/bash --home-dir /home/gentlefist openhands \
    && echo 'gentlefist ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/gentlefist \
    && echo 'openhands ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/openhands \
    && chmod 440 /etc/sudoers.d/gentlefist /etc/sudoers.d/openhands \
    && ln -sf /usr/bin/python3 /usr/local/bin/python \
    && mkdir -p /workspace /openhands/code /openhands/micromamba/bin /openhands/poetry \
    && chown -R gentlefist:gentlefist /workspace /openhands /home/gentlefist

COPY containers/machine/micromamba-shim /openhands/micromamba/bin/micromamba
RUN chmod 755 /openhands/micromamba/bin/micromamba

WORKDIR /openhands/code
COPY --chown=gentlefist:gentlefist pyproject.toml poetry.lock README.md LICENSE ./
COPY --chown=gentlefist:gentlefist openhands ./openhands
COPY --chown=gentlefist:gentlefist microagents ./microagents

ARG INSTALL_RUNTIME=1
RUN if [ "${INSTALL_RUNTIME}" = "1" ]; then \
      pip install --no-cache-dir "poetry>=2.1.2,<3" \
      && poetry install --only main --no-root --no-interaction; \
    fi \
    && chown -R gentlefist:gentlefist /openhands

WORKDIR /workspace
# The action execution server starts as root and drops to the workspace user,
# matching the existing runtime images. Operator shells should pass
# `--user gentlefist`.
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["bash"]
