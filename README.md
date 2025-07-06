## 🚀 배포 구성

NestJS 기반 백엔드 서버는 AWS EC2와 RDS를 사용해 배포하였으며,  
Cloudflare를 통한 HTTPS 인증 및 GitHub Actions 기반 자동화 배포 파이프라인을 구성했습니다.

---

### 🔧 인프라 구성 요약

| 구성 요소        | 사용 기술                     |
|------------------|-------------------------------|
| 서버             | AWS EC2 (Ubuntu)              |
| 데이터베이스     | AWS RDS (PostgreSQL)          |
| 자동 배포        | GitHub Actions + S3 + cronjob |
| 도메인 및 DNS    | Cloudflare                    |
| 리버스 프록시    | Nginx                         |
| 프로세스 관리    | PM2                           |
| HTTPS 인증서     | Cloudflare Full SSL           |

---

### 🌐 도메인 및 HTTPS 구성

- 도메인: [`https://stockgame.cc`](https://stockgame.cc)
- Cloudflare를 통해 도메인 구매 및 DNS 설정
- SSL 인증은 Cloudflare Full SSL 모드를 사용하여 설정

---

### 🔁 리버스 프록시 (Nginx)

- 외부 요청은 Nginx가 80/443 포트에서 수신하고 내부 NestJS 서버(`localhost:3000`)로 프록시
- SSL Termination은 Nginx에서 처리

**예시 설정:**

```nginx
server {
  listen 80;
  server_name stockgame.cc www.stockgame.cc;

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
