---
title: 우분투 dpkg/lock-fronted 에러 해결 방법
tags: [linux]
author: Esan
---

즐거운 마음으로 GitLab Runner를 설치하던 도중 처음 보는 문제에 직면혔다.

> `E: Could not get lock /var/lib/dpkg/lock frontend - open (11: Resource temporarily unavailable)`  
> `E: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), is another process using it?`

~~우분투님, 저한테 대체 왜 이러세요. 안 그러셨잖아요.~~  
찾아보니 이런 문제는 다음과 같은 이유에서 발생한다고 한다.

> You see this error because some other program is trying to update Ubuntu. When a command or application is updating the system or installing a new software, it locks the dpkg file.

즉, 다른 프로그램이 우분투를 업데이트하려 할 때 dpkg file이 잠겨서 발생하는 문제라는 것이다.
## lock-frontend 오류 해결 방법

![image](https://user-images.githubusercontent.com/61646760/130943711-ca7ed787-1acf-48b3-83a1-c0017e803239.png)

상기 이미지에서 보이듯, GitLab Runner를 설치하려던 나의 노력은 **lock-frontend 에러**에 의해 저지당했다. 이 경우 아래와 같이 입력해 주면 된다.

1. 터미널의 모든 프로세스를 죽인다.  
`sudo killall apt apt-get`
2. lock 파일들을 모두 지워 준다.  
`sudo rm /var/lib/apt/lists/lock`  
`sudo rm /var/cache/apt/archives/lock`  
`sudo rm /var/lib/dpkg/lock*`
3. dpkg 전체 configure  
`sudo dpkg --configure -a`
4. apt update  
`sudo apt update`
5. 설치하려던 것 재설치 (아래의 경우는 깃랩 러너)  
`sudo apt-get install gitlab-runner`

상기 이미지 하단에서 보이는 것처럼, 아주 잘 설치된다. 어때요, 참 쉽죠?
