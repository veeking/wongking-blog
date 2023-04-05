---
date: 2022-04-05
category:
  - 技术
tag:
  - webAudio
  - 音频
---

# 聊聊声音的产生到Web音频的播放

## 前言
在我们的生活中，声音无处不在，悦耳的音符构建了美妙的音声世界。不久前因业务需求，与WebAudio接触了一段时间，用它来封装了一个简单的音频播放插件，于是开始对音频的产生好奇起来，为什么木讷呆板只认识0和1的计算机能够播放出优雅美妙的音符旋律。接着便开始了对声音的产生到音频播放整个流程做了基本的科普调研，并从前端的视角，揭示声音的采集、录制、播放以及Web中的录制和播放原理。

![图 2](/assets/posts/8c626e9fc1e05f3894f36fb00158d1ddb2406d0d9e60a6b85ec3d688cb2f0a4a.jpeg)  

## 声音的产生过程
我们先从人声音是如何产生的开始说起，当物体振动时，会产生声波。声波通过空气中的分子传播，最终到达我们的耳朵。我们的耳朵可以将声波转换成神经信号，经过大脑处理后，我们就可以听到声音。例如，当我们说“哆来咪”，声音是通过我们的声带振动产生的。
而在计算机中，是需要经过声音的采集、编码转换、播放这几个过程，采集的过程可以理解为耳朵鼓膜发生振动，编码转换是振动声波转换为神经信号编码，最后播放过程则是大脑听觉皮层处理和解析声音。下面我们分别对采集录制、编码播放几个过程进行详细说明。

![图 3](/assets/posts/0f121cefb699ba6fb5cea2ffb0ebcfda4af7416682f05175f9984751946307c0.jpeg)  


### 声音的采集与录制

为了能够在电子设备上保存和播放声音，我们需要将声音录制成数字信号。这个过程可以分为以下几个步骤：
1. 物理物体发出声音
2. 使用麦克风等录制工具采集声音
3. 声波让麦克风内部的振膜触发机械震动
4. 机械震动触发麦克风电路逻辑，产生模拟电信号
5. 麦克风设备传输模拟电信号给声卡设备，声卡的ADC（模-数转换器）接收数据
6. ADC转换器按照采样率将连续的电信号进行采样，得到离散的采样值
7. 采样值根据采样位数进行量化取值，将模拟信号转成数字信号
8. 将量化值编码成二进制值，形成完整数字信号（编码过程）
9. 将编码后的数据保存为PCM原始格式的文件，文件容量较大
10. 通过相关编码格式算法对PCB原始文件压缩处理生成常规格式音频文件，如MP3、AAC、WAV或Opus格式

![图 1](/assets/posts/ee8e69971a63035d38cac34a4f9c2ed8c68557f658b542b0055621540db6de58.jpeg)  

### 声音的解码与播放

当我们想要播放录制或格式化好的音频文件时，需要经过以下几个步骤：

1. 读取音频文件，提取音频数据和元信息
2. 使用解码工具（如FFmpeg）对音频数据进行解码，还原为原始PCM格式数据
3. 将PCM格式数据经过DAC（数-模转换器）还原为模拟电信号
4. 声卡按照给定的比特率传送模拟电信号给扬声器
5. 扬声器接收信号，扬声器的振膜随着电信号的变化而震动，产生声音

![图 4](/assets/posts/c47000a0d499ef5a868cde16cdeba87d6e6b3e539c1ef1a111c398a0f3624181.jpeg)  


### 总结

采集与录制过程：`音频声卡驱动 -> PCM -> MP3 编码 -> MP3 文件`  
解码与播放过程：`MP3 文件 -> MP3 解码 -> PCM -> 音频声卡驱动 -> 驱动扬声器进行播放`

```plaintext
  采集与录制过程：                     解码与播放过程：
+-------------------+                   +---------------------+
| 麦克风采集           |                   | 驱动扬声器进行播放    |
+-------------------+                   +---------------------+
           |                                      ^
           v                                      |
+-------------------+                   +---------------------+
| 音频声卡驱动        |                   | 音频声卡驱动          |
+-------------------+                   +---------------------+
           |                                      ^
           v                                      |
+-------------------+                   +---------------------+
| PCM               |                   | PCM                 |
+-------------------+                   +---------------------+
           |                                      ^
           v                                      |
+-------------------+                   +---------------------+
| MP3 编码            | -----------------> | MP3 解码             |
+-------------------+                   +---------------------+
           |                                      ^
           v                                      |
+-------------------+                   +---------------------+
| MP3 文件            | -----------------> | MP3 文件             |
+-------------------+                   +---------------------+
```

## Web中的音频录制和播放
音频在 Web 应用中有着广泛的应用，例如在线音乐播放、[WebRTC](https://webrtc.org/?hl=zh-cn)实时语音通话和语音识别等。下面我们将介绍在Web中音频的录制和播放。

![图 5](/assets/posts/ae44b1b2793cb1e3c23d6aa32ec00df204853a01d5d6f27c9fb75559a507eaf0.jpeg)  


### Web音频录制
在 Web 应用中录音，首先需要通过 `MediaDevices.getUserMedia()`获取用户的录音权限。获取权限后，我们可以使用 [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) 来录制音频。具体步骤如下：

1. 调用 `MediaDevices.getUserMedia()` 方法获取设备的音频流
2. 使用 `new MediaRecorder(stream[, options])` 创建一个 `MediaRecorder` 实例，传入获取到的音频流
3. `MediaRecorder` 会根据传入的音频流获取音频数据，并将音频数据包装成 Blob 对象，通过 `ondataavailable` 事件返回给前端
4. 前端接收到 `Blob` 数据后，可以根据 `Blob` 对象创建音频文件

示例代码：
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });
  
    // 开启录制
    mediaRecorder.start();

    // 停止录制并生成录制音频文件
    setTimeout(() => {
      mediaRecorder.stop();

      const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
      const audioFile = new File([audioBlob], 'recorded.mp3');
      // do something by audioFile
    }, 5000);
  });
```

### Web音频播放
浏览器提供了两种播放方式，一种是常规HTML5的 [\<audio\>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio) 标签，另一种则是功能更加强大的[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)。下面分别对两种方式进行播放说明。


#### 使用Web Audio API来播放
创建一个`AudioContext`对象，读取音频文件的`ArrayBuffer`数据，然后将数据解码并传递给音频节点进行播放。 
简要原理流程：
1. 读取音频文件，获取文件的 `ArrayBuffer` 数据。
2. 将 `ArrayBuffer` 数据解码成原始 `PCM` 数据。这可以通过 `Web Audio API` 的 `decodeAudioData()` 方法实现。
3. 使用 `Web Audio API` 的 `AudioBufferSourceNode` 接口创建一个音频源节点，将解码后的 `PCM` 数据传入。
4. 将音频源节点连接到 `AudioContext` 实例，播放音频。

示例代码： 
 
录制创建好的音频文件播放

```javascript
// audioFile为上述录制创建好的音频文件
// 通过FileReader读取Blob对象的ArrayBuffer数据
const reader = new FileReader();
reader.readAsArrayBuffer(audioFile);
reader.onload = () => { 
  const audioData = reader.result;

  // 创建audio上下文实例，解码后进行播放  
  const audioContext = new AudioContext();
  audioContext.decodeAudioData(audioData)
    .then(buffer => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    });
};
```

单独的文件播放：

```javascript
const audioContext = new AudioContext();

fetch('path/to/audioFile.mp3')
  .then(response => response.arrayBuffer())
  .then(data => audioContext.decodeAudioData(data))
  .then(buffer => {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  });
```

#### 使用HTML5的\<audio\>播放
简要原理流程：
1. 解析和加载，解析audio标签和属性，加载音频文件地址
2. 缓冲和解码，加载音频数据后缓存在内存中，然后浏览器通过调用底层解码库`(FFmpeg、Opus、libmp3lame)`进行解码
3. 播放，解码后的音频数据发送到扬声器实现音频播放
  
示例代码：
```javascript
// 为录制音频File Blob文件创建URL
const audioUrl = URL.createObjectURL(audioFile);

// 创建audio元素并设置src属性地址后进行播放
const audioElement = document.createElement('audio');
audioElement.src = audioUrl;

audioElement.play();
```
## 总结

在本文中，我们从声音的采集、录制、播放以及Web中的录制和播放原理出发，简要概括了声音的产生与播放过程。在Web领域，我们可以利用`MediaRecorder`来实现音频的录制，通过`Web Audio API`和`HTML5 Audio`来实现最终的播放功能。其中，`Web Audio API`提供了一套功能更全面的音频处理接口，可以轻松地实现丰富的音频应用，如音频可视化、音效处理等，为Web应用带来各种有趣且富有创意的音频效果。





