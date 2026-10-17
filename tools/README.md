# Portfolio Pages

`docs/`는 https://choiyhunn.github.io/choiYhunn/ 에 그대로 배포되는 정적 사이트입니다. build 단계가 없고, 페이지 이동은 hash route(`#project/canfd`, `#doc/...`)라서 새로고침과 직접 URL 접근에 서버 설정이 필요 없습니다.

## 출처

- 화면과 기능: 로컬 `yonghun-brain-dashboard-v0.3`의 `public-portfolio/` 묶음(2026-09-27)을 그대로 사용했습니다. 개인용 Brain 화면, `server.py`, 개인 원문 묶음은 포함하지 않습니다.
- 지식 노트 46개: `choiYhunn/ai-shared-brain` main `e4f8ebf`의 `brain/knowledge/` 원문입니다. frontmatter와 출처 섹션(강의 자료 파일명, 해시, 로컬 경로)을 제거했습니다.
- 프로젝트 기술 기록 2개(CAN-FD, AMET): 같은 commit의 정본에서 기술 섹션만 발췌했습니다. 지원서용 서술 전략, 비공개 저장소 식별자, 공동저자·팀원 실명, 내부 경로, 상금은 제외했습니다.
- 삼성전자 DS 실습은 원래 공개 묶음의 요약만 사용하며, Shared Brain의 실습 문서는 포함하지 않습니다.

## 공개 경계

`docs/`의 모든 파일은 `tools/PUBLISH_ALLOWLIST.txt`에 정확한 경로로 있어야 합니다. 파일을 추가하거나 지울 때는 목록도 함께 고칩니다.

```bash
python tools/verify_public_site.py check
python tools/verify_public_site.py live https://choiyhunn.github.io/choiYhunn/
```

`check`는 허용 목록, 금지 패턴(토큰·키·전화번호·비공개 경로·강의 원자료·팀원 실명·사내 시스템), index.html의 asset 참조를 검사합니다. `.github/workflows/pages.yml`은 main push마다 check → deploy → live 검증을 실행하고, live 단계는 배포된 바이트가 저장소와 같은지와 비공개 경로가 404인지 확인합니다.
