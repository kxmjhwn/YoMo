# YoMo
2020 졸업프로젝트 / 모자이크해조  
YOLOv2(darkflow)를 활용한 영상 속 유해, 개인정보 이미지 탐지 및 모자이크 처리 서비스 
<br>
<br>
# 설명
* darkflow 설치 및 초기 설정 과정(CUDA, cudnn설치 등)이 필요합니다. (https://github.com/thtrieu/darkflow)
* 가중치 파일과 학습에 사용한 이미지 데이터는 업로드를 생략했습니다.
1. cfg : 모델 세부 설정 파일들입니다.
2. training : 학습진행 및 테스트 코드들입니다.  
"_addr", "_carnumber(carnum)", "_knife", "_cigarette" 은 각각 도로명주소, 차 번호판, 칼, 담배에 대한 단일 탐지 파일,  
"_demon"은 4개의 항목에 대한 다중 탐지 파일
3. server : 웹페이지 및 서버(localhost) 구현 파일들입니다.
4. yomo.py : 서버와 연동되어 학습된 모델을 통해 탐지 및 모자이크 처리를 진행하는 코드입니다.
