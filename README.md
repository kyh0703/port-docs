# Overthinker 공개 문서

이 저장소는 Mintlify에 게시할 고객용 문서의 원본이다. `docs.json`은 사이트 설정과 한국어·영어 탐색을 정의하고, `index.mdx` 및 `en/` 아래 MDX는 각각 공개 문서 본문이다.

내부 설계, 운영 절차, 보안 경계, DB migration 및 배포 전 구현 이력은 비공개 `port-spec`에 남긴다. 그 문서를 이 저장소로 일괄 복사하지 않는다. 공개 릴리즈 노트는 운영 환경 반영을 확인한 뒤 고객에게 영향을 주는 변경만 작성한다. 아직 운영 반영이 확인되지 않은 항목은 게시하지 않는다.

문서 수정 시 양쪽 언어를 함께 갱신하고 `mint validate`, `mint broken-links`를 실행한다. Mintlify GitHub 연결은 `kyh0703/port-docs` 저장소의 `main`을 사용한다.
