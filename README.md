# YoMo

#### **"YoMo"는 인공지능 기반 실시간 객체 탐지 알고리즘인 "YOLO"와 프로젝트의 주제인 "Mosaic"의 합성어로, 동영상 속 유해 이미지 또는 개인정보 이미지를 자동으로 탐지하여 이를 모자이크 처리하는 시스템"**

* 기간 : 2020.03 ~ 2020.12

* blog : https://kxmjhwn.tistory.com/242?category=1121129
  
  * 파일 설명
  
    * cfg : 모델 세부 설정 파일
    
    * training : 학습 진행 및 테스트 코드
    
    * [_addr], [_carnumber], [_knife], [_cigarette] : 도로명 주소, 차 번호판, 칼, 담배에 대한 단일 탐지 파일
    
    * [_demon] : 위 4개 항목에 대한 다중 탐지 파일
    
    * server : 웹 페이지 및 서버(localhost) 구현 파일
    
    * yomo.py : 서버와 연동되어 학습된 모델을 통해, 탐지 및 모자이크 처리를 진행하는 코드
