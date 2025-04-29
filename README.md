## Deployment Architecture

This server is deployed using an automated GitHub Actions + AWS S3 + EC2 + RDS pipeline.

### Infrastructure Setup

- **EC2**: AWS EC2 instance (Ubuntu) hosts the NestJS server.
- **RDS**: AWS RDS (PostgreSQL) used for production database.
- **S3**: Build artifacts are uploaded to S3 bucket for deployment.

### Deployment Flow

1. **GitHub Actions** automatically builds the project upon push to `main` branch.
2. Build artifacts are uploaded to **AWS S3**.
3. **EC2 server** uses a scheduled **cron job** to periodically fetch the latest build from S3.
4. After fetching, the server automatically restarts using **PM2** (or systemd).

### Technical Challenges and Solutions

- **Issue**: GitHub Actions cannot directly access EC2 due to dynamic IP changes.
- **Solution**: Implemented an S3-based deployment system as an intermediate step.

  - **Why**: GitHub Action IPs are dynamic and hard to whitelist.
  - **Result**: Stable, fully automated, and secure deployment flow without manual IP management.

### Summary

- Fully automated CI/CD pipeline without manual server intervention.
- Designed to be resilient against network/IP change issues.
- Easily scalable for multiple servers in the future by sharing the same S3 artifacts.

