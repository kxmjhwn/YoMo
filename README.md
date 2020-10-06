# YoMo
2020 졸업프로젝트 / 모자이크해조  
YOLOv2(darkflow)를 활용한 영상 속 유해, 개인정보 이미지 탐지 및 모자이크 처리 서비스 
<br>
<br>
# 설명
1. darkflow 설치 및 초기 설정 과정(CUDA, cudnn설치 등)이 필요합니다. (https://github.com/thtrieu/darkflow)
2. cfg : 모델 세부 설정 파일들입니다.
3. training : 학습진행 및 테스트 코드들입니다.  
"_addr", "_carnumber(carnum)", "_knife", "_cigarette" 은 각각 도로명주소, 차 번호판, 칼, 담배에 대한 단일 탐지 파일,  
"_demon"은 4개의 항목에 대한 다중 탐지 파일
4. ckpt : 학습 파일(가중치)입니다.
5. server : 웹사이트 및 서버(localhost) 연동 파일들입니다.  
cmd에서 "node index.js" 명령어를 통해 서버 활성화. 브라우저에서 http://localhost:3030/mosaic.htm로 접속
