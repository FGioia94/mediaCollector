#!/usr/bin/env bash
set -Eeuo pipefail

DEPLOY_DIR="${1:-/opt/media-collector}"
NETWORK_NAME="${2:-mediahub-net}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root or with sudo."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y ca-certificates curl gnupg

install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.asc ]]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
fi

ARCH="$(dpkg --print-architecture)"
CODENAME="$(. /etc/os-release && echo "$VERSION_CODENAME")"
echo \
  "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${CODENAME} stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl restart docker

mkdir -p "$DEPLOY_DIR"
chmod 755 "$DEPLOY_DIR"

docker network inspect "$NETWORK_NAME" > /dev/null 2>&1 || docker network create "$NETWORK_NAME"

echo "Server bootstrap complete."
echo "Deploy directory: $DEPLOY_DIR"
echo "Docker network: $NETWORK_NAME"
echo "Next: copy deploy files into $DEPLOY_DIR and run the GitHub Actions pipeline."
