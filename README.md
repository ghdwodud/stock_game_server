## 배포 구성

본 서버는 실제 서비스 수준의 인프라를 기반으로 운영되고 있으며,  
**도메인 연결, HTTPS 인증서, 자동화 배포 파이프라인까지 직접 구성**하였습니다.

---

### 🔧 인프라 구성 요약

| 구성 요소 | 사용 기술 |
|-----------|-----------|
| 서버 | AWS EC2 (Ubuntu) |
| DB | AWS RDS (PostgreSQL) |
| 배포 자동화 | GitHub Actions + S3 + cron |
| 도메인 | Cloudflare |
| 리버스 프록시 | Nginx |
| 프로세스 관리 | PM2 |
| 인증서 | Cloudflare Full SSL |

---

### 🌐 도메인 및 HTTPS 구성

- 도메인: `https://stockgame.cc`
- Cloudflare를 통해 도메인 구매 및 DNS 설정
- SSL 인증은 Cloudflare Full SSL 모드 사용

---

### 🔁 리버스 프록시 (Nginx)

- 외부 요청은 Nginx가 80/443 포트에서 받아 내부 NestJS 서버로 전달
- SSL 종료(SSL termination)도 Nginx에서 수행
- 예시 설정:

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
