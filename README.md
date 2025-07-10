# 🚀 배포 구성

NestJS 기반 백엔드 서버는 AWS EC2에 Docker Compose를 활용해 배포하였으며,  
Let's Encrypt + Nginx를 통한 HTTPS 인증 구성을 적용했습니다.

---

## 🔧 인프라 구성 요약

| 구성 요소     | 사용 기술                                 |
| ------------- | ----------------------------------------- |
| 서버          | AWS EC2 (Ubuntu)                          |
| 데이터베이스  | Docker Compose 기반 PostgreSQL (EC2 내부) |
| 도메인 및 DNS | stockgame.cc (일반 DNS 설정)              |
| 리버스 프록시 | Nginx                                     |
| HTTPS 인증서  | Let's Encrypt (Certbot)                   |

---

## 🌐 도메인 및 HTTPS 구성

- 도메인: [`https://stockgame.cc`](https://stockgame.cc)
- 도메인 구매 후 DNS 설정을 통해 EC2 퍼블릭 IP에 연결
- SSL 인증은 Certbot + Nginx 기반으로 설정

---

## 🔁 리버스 프록시 (Nginx)

- 외부 요청은 Nginx가 80/443 포트에서 수신하고 내부 NestJS 서버(`stockgame-server:3000`)로 프록시
- SSL Termination은 Nginx에서 처리

### 예시 Nginx 설정 (`default.conf`):

```nginx
# HTTP 요청은 HTTPS로 리디렉션
server {
  listen 80;
  server_name stockgame.cc www.stockgame.cc;

  return 301 https://$host$request_uri;
}

# HTTPS 요청 처리
server {
  listen 443 ssl;
  server_name stockgame.cc www.stockgame.cc;

  ssl_certificate /etc/letsencrypt/live/stockgame.cc/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/stockgame.cc/privkey.pem;

  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  location / {
    proxy_pass http://stockgame-server:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```
