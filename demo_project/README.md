# Docker Commands Reference

This file contains useful Docker commands for this project.

## 1) Run Node app container with bind mount + named volume

```bash
docker run --rm -p 300:3000 \
  -v "/home/mekin/Desktop/Projects/docker/node:/app" \
  -v /app/node_modules \
  -v todo:/app/todo \
  2627b7188c82
```

### Notes
- `--rm`: remove the container after it stops.
- `-p 300:3000`: map host port `300` to container port `3000`.
- `-v "/home/mekin/Desktop/Projects/docker/node:/app"`: mount local source code into `/app`.
- `-v /app/node_modules`: keep container dependencies isolated from host.
- `-v todo:/app/todo`: use named volume `todo` for persistent todo data.

## 2) Run backend container with host access

```bash
docker run --name updated_serv -p 5000:5000 \
  --add-host=host.docker.internal:host-gateway \
  backend_main
```

### Notes
- `--name updated_serv`: sets container name.
- `-p 5000:5000`: maps backend service port.
- `--add-host=host.docker.internal:host-gateway`: allows container to reach host services.

## Helpful extras

### Show running containers
```bash
docker ps
```

### Show all containers
```bash
docker ps -a
```

### Show images
```bash
docker images
```

### Stop a container
```bash
docker stop updated_serv
```

### Remove a container
```bash
docker rm updated_serv
```

### Remove unused resources
```bash
docker system prune -f
```
