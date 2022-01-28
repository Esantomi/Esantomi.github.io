---
title: Ubuntu 20.04 기준 Gephi 설치 방법
tags: [Tool, Platform]
style: 
color: 
description: ubuntu 20.04에서 Gephi 설치하기
---

![image](https://user-images.githubusercontent.com/61646760/151572533-fe9dc2fe-6ec1-4b74-8c43-636614d97dfa.png)

**Gephi**는 오픈소스 네트워크 분석·시각화 소프트웨어 패키지다.

> Gephi is an open-source network analysis and visualization software package written in Java on the NetBeans platform.

Gephi에 대한 보다 자세한 설명은 [Gephi 홈페이지](https://gephi.org/) 또는 [Gephi github repository](https://github.com/gephi/gephi)를 참고하길 바라며, 본 포스팅에서는 Gephi를 Linux 환경, 그중에서도 Ubuntu 20.04에 설치하는 방법을 다루고자 한다.

특별히 까다로운 사항은 없으나 jdk version 문제로 충돌하는 경우가 있으니 이에 주의하기를 바란다.

## 설치 과정

1. 가장 최근 버전의 Gephi를 다운받는다. (터미널에 아래 명령어를 입력)  
```
wget -q --show-progress https://github.com/gephi/gephi/releases/download/v0.9.2/gephi-0.9.2-linux.tar.gz
```
- 이때 `-q`는 `wget`이 output을 갖지 않는다는 것을, `--show-progress`는 사용자에게 다운로드 진행 상황을 보여 줄 것을 의미한다.

2. 다운받은 Gephi 압축 파일의 압축을 풀어 준다. (터미널에 아래 명령어를 입력)  
```
tar xzf gephi-0.9.2-linux.tar.gz
```

3. 컴퓨터에 java가 설치돼 있는지 확인한다. (터미널에 아래 명령어를 입력)  
```
java --version
```

4. `openjdk version`이 아래와 같이 `1.8`로 나오면 다음 단계로 넘어가고, 다른 버전이 설치돼 있다면 지우고 재설치, 설치된 게 없다면 새롭게 설치해 준다. (다른 버전이 깔려 있을 경우 충돌로 인해 실행되지 않을 수 있음)   
![image](https://user-images.githubusercontent.com/61646760/151576839-26aa0f42-f753-4c56-84f1-1858ed257332.png)
- 기존 버전을 삭제하는 방법은 다음과 같다. (터미널에 아래 명령어를 순서대로 입력)
```
sudo apt-get remove oepnjdk*
sudo apt-get autoremove --purge
sudo apt-get autoclean
```
- 1.8 version(jdk-8)을 설치하는 방법은 다음과 같다. (터미널에 아래 명령어를 순서대로 입력)
```
sudo add-apt-repository ppa:openjdk-r/ppa
sudo apt update
sudo apt install openjdk-8-jdk openjdk-8-jre
```

5. Gephi를 실행한다.  
```
./gephi-0.9.2/bin/gephi
```
![image](https://user-images.githubusercontent.com/61646760/151578690-7dc242a3-f630-4ea3-bad0-38e4ed04e89b.png)

