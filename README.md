<a name="readme-top"></a>

<div align="center">
  <img src="./docs/static/img/logo.png" alt="Gentle Fist" width="200">
  <h1 align="center">Gentle Fist</h1>
  <p>Code less. Make more.</p>
</div>

<div align="center">
  <a href="https://gentle-fist.dev"><img src="https://img.shields.io/badge/Website-gentle--fist.dev-black?style=for-the-badge" alt="Gentle Fist"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-AGPL--3.0--only-blue?style=for-the-badge" alt="AGPL-3.0-only"></a>
  <br/>
  <a href="https://gentle-fist.dev"><img src="https://img.shields.io/badge/Documentation-000?logo=googledocs&logoColor=white&style=for-the-badge" alt="Documentation"></a>
  <a href="https://arxiv.org/abs/2407.16741"><img src="https://img.shields.io/badge/Paper%20on%20Arxiv-000?logoColor=FFE165&logo=arxiv&style=for-the-badge" alt="Paper on Arxiv"></a>

  <hr>
</div>

Gentle Fist is a platform for software development agents, created by Spectrum Web Co in 2026.
Agents can modify code, run commands, browse the web, and call APIs from a workspace you control.

Use it at [https://gentle-fist.dev](https://gentle-fist.dev).

## Running Gentle Fist locally

### CLI launcher

The CLI launcher uses [uv](https://docs.astral.sh/uv/) and keeps the agent separate from your project's virtual environment.

```bash
# Launch the GUI server
uvx --python 3.12 --from openhands-ai openhands serve

# Or launch the CLI
uvx --python 3.12 --from openhands-ai openhands
```

The package and command are still named `openhands` so existing installs keep working. The GUI is served at [http://localhost:3000](http://localhost:3000).

### Gentle Fist Machine

The agent runs shell and workspace commands inside the Gentle Fist Machine image. Build it, then point the app at it. That image name is also the default `runtime_container_image`.

```bash
docker build -f containers/machine/Dockerfile -t gentlefist/machine:latest .

export SANDBOX_RUNTIME_CONTAINER_IMAGE=gentlefist/machine:latest
make run
```

An operator can open a shell in the machine without starting the app:

```bash
docker run --rm -it --user gentlefist \
    -v "$PWD":/workspace -w /workspace \
    gentlefist/machine:latest
```

See [containers/README.md](./containers/README.md). On a public network, bind the service to localhost and do not expose the Docker socket more broadly than you need.

### Julia Genie server (experimental)

An experimental Julia server reuses the same Python business logic:

```bash
julia --project=julia_genie julia_genie/start.jl
```

See [`julia_genie/README.md`](./julia_genie/README.md).

## Getting started

Choose an LLM provider and add an API key in the app.
[Anthropic's Claude Sonnet 4.5](https://www.anthropic.com/api) (`anthropic/claude-sonnet-4-5-20250929`) is a strong default. More options are documented at [https://gentle-fist.dev](https://gentle-fist.dev).

Gentle Fist is meant to be run by a single user on their own machine. It does not add multi-tenant authentication.

To change the source, start with [Development.md](./Development.md).

## Documentation

Operator and product docs live in [`docs/`](./docs/) and at [https://gentle-fist.dev](https://gentle-fist.dev).

## License

Gentle Fist is licensed under the GNU Affero General Public License v3.0 only (AGPL-3.0-only). Copyright (C) 2026 Spectrum Web Co. See [`LICENSE`](./LICENSE).

The `enterprise/` directory, when present, remains under the license in [`enterprise/LICENSE`](./enterprise/LICENSE).

## Cite

The research platform this product builds on is described in:

```
@inproceedings{
  wang2025openhands,
  title={OpenHands: An Open Platform for {AI} Software Developers as Generalist Agents},
  author={Xingyao Wang and Boxuan Li and Yufan Song and Frank F. Xu and Xiangru Tang and Mingchen Zhuge and Jiayi Pan and Yueqi Song and Bowen Li and Jaskirat Singh and Hoang H. Tran and Fuqiang Li and Ren Ma and Mingzhang Zheng and Bill Qian and Yanjun Shao and Niklas Muennighoff and Yizhe Zhang and Binyuan Hui and Junyang Lin and Robert Brennan and Hao Peng and Heng Ji and Graham Neubig},
  booktitle={The Thirteenth International Conference on Learning Representations},
  year={2025},
  url={https://openreview.net/forum?id=OJd3ayDDoF}
}
```
