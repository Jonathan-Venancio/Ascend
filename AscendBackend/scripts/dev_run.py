"""Abre backend e frontend em terminais separados."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "AscendBackend"
FRONTEND = ROOT / "AscendFrontend"

BACKEND_CMD = "poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000"
FRONTEND_CMD = "npm run dev -- --host"


def _keep_open(command: str) -> str:
    return f"{command}; echo; read -r -p 'Pressione Enter para fechar...'"


def open_terminal(title: str, cwd: Path, command: str) -> None:
    shell_cmd = _keep_open(command)

    if shutil.which("ptyxis"):
        subprocess.Popen(
            [
                "ptyxis",
                "--new-window",
                f"--title={title}",
                f"--working-directory={cwd}",
                "--",
                "bash",
                "-lc",
                shell_cmd,
            ],
            start_new_session=True,
        )
        return

    if shutil.which("gnome-terminal"):
        subprocess.Popen(
            [
                "gnome-terminal",
                f"--title={title}",
                f"--working-directory={cwd}",
                "--",
                "bash",
                "-lc",
                shell_cmd,
            ],
            start_new_session=True,
        )
        return

    if shutil.which("x-terminal-emulator"):
        subprocess.Popen(
            [
                "x-terminal-emulator",
                "-T",
                title,
                "-e",
                "bash",
                "-lc",
                f"cd {cwd!s} && {shell_cmd}",
            ],
            start_new_session=True,
        )
        return

    print(
        "Nenhum terminal gráfico encontrado (ptyxis/gnome-terminal/x-terminal-emulator).",
        file=sys.stderr,
    )
    sys.exit(1)


def main() -> None:
    open_terminal("Ascend Backend", BACKEND, BACKEND_CMD)
    open_terminal("Ascend Frontend", FRONTEND, FRONTEND_CMD)
    print("Terminais abertos: backend (8000) e frontend (8080).")


if __name__ == "__main__":
    main()
