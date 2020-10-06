import cv2
from darkflow.net.build import TFNet
import matplotlib.pyplot as plt
import numpy as np
import pprint
import sys

###### 1. 탐지 환경을 초기화하기 위한 option 설정
options = {
    'model': "cfg/yolo-voc-test-demon.cfg",  # 탐지에 쓰일 cfg파일 설정
    'load': 218430,  # 탐지에 쓰일 학습 파일 설정. -1일 경우 가장 최근까지 학습시킨 파일을 설정함.
    'threshold': 0.6,  # 탐지했다고 인정할 확률을 설정 0.6이면 정확도가 60% 이상인 것만 탐지.
    'gpu': 0.5,  # 탐지시 GPU를 몇 퍼센트 사용할 지.
}

tfnet = TFNet(options)  # 설정한 옵션으로 탐지 환경을 초기화함.

# local server로부터 인자 받아오기
detect_list = []  # 탐지할 항목 list
length_argv = len(sys.argv) - 2
for i in range(1, length_argv):  # 제일 마지막엔 영상파일 이름이 들어오는 것을 이용
    if i < length_argv - 1:
        detect_list.append(sys.argv[i])
    elif i == length_argv - 1:
        video_name = sys.argv[i]

###### 2. 사용할 영상 설정
cap = cv2.VideoCapture('public/uploads/' + video_name)  # 사용할 영상 설정
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))  # 사용할 영상 width
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))  # 사용할 영상 height

###### 3. 결과물을 저장할 영상 설정
fourcc = cv2.VideoWriter_fourcc(*'XVID')  # 결과물을 저장할 비디오 코덱 설정 XVID
writer = cv2.VideoWriter('public/downloads/'+video_name+'result.avi', fourcc, 30.0, (width, height))  # 30fps 짜리 XVID코덱으로 결과물을 저장할 것임

###### 4. 탐지 진행
while (cap.isOpened()):  # 비디오가 정상적으로 열려있다면
    ret, frame = cap.read()  # 비디오로부터 한 장면(frame) 를 따옴
    if ret == False:
        break
    result = tfnet.return_predict(frame)  # 따온 frame에서 탐지를 진행함
    result_img = frame.copy()

    # 모자이크 처리 부분
    if result:  # 탐지한 부분이 있다면
        for res in result:
            if res['label'] in detect_list:  # detectList에 있는 것만 진행함

                # 탐지된 부분의 좌표를 따오는 부분 (target 이라는 변수로 저장)
                x = res['topleft']['x']
                y = res['topleft']['y']
                w = res['bottomright']['x']
                h = res['bottomright']['y']
                target = frame[y:h, x:w]
                # blur처리 (target을 블러처리함)
                flt = cv2.blur(target, (70, 70))
                result_img[y:h, x:w] = flt
                tl = (x, y)
                br = (w, h)
    else:
        result_img = frame.copy()

    writer.write(result_img)  # 탐지까지 완성된 한 장면(frame)을 결과물에 하나씩 쌓아서 영상으로 만듦
    if cv2.waitKey(1) & 0xFF == 27:
        break

cv2.destroyAllWindows()