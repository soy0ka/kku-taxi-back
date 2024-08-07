# KKU Taxi Backend

## 설치 및 실행

### 요구 사항
- Node.js (v18 이상)
- Yarn (npm도 가능)
- Mysql (Mariadb도 가능)
  
### 설치

```bash
# 리포지토리 클론
git clone https://github.com/soy0ka/kku-taxi-back.git
cd kku-taxi-back

# 의존성 설치
yarn install
```

### 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 필요한 환경 변수를 설정합니다:

```env
GOOGLE_APPLICATION_CREDENTIALS="Path/to/your/file"
DATABASE_URL="scheme://id:password@host:port/databseName"
MAIL_HOST=example.com
MAIL_PORT=587
MAIL_USER=example
MAIL_PASS=youshallnotpass
JWT_SECRET=1234
PORT=3000
```

### 데이터베이스 마이그레이션
```bash
yarn prisma migrate deploy
```

### 서버 실행
```bash
yarn build
yarn start
```
개발서버 실행시
```bash
yarn dev
```
> 개발 서버의 경우 nodemon을 이용하여 실시간 변경사항 추척및 리로드 합니다

## 배포
GitHub Actions를 통해 자동 배포가 설정되어 있습니다. `main` 브랜치에 변경 사항이 푸시되면 자동으로 배포됩니다.

## 기여
기여를 환영합니다! 이 리포지토리를 포크하고 풀 리퀘스트를 생성해 주세요.

## 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [`LICENSE`](https://github.com/soy0ka/kku-taxi-back/blob/master/LICENSE) 파일을 참조하세요.

## 문의
프로젝트 관련 문의사항은 [Issues](https://github.com/soy0ka/kku-taxi-back/issues)를 통해 남겨주세요.
