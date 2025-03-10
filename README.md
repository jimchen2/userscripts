Planned: Hover words and translate on YouTube, add functionality to VK, split script into multiple files

## My Userscripts

- [Block Extremist Websites](https://update.greasyfork.org/scripts/528052/Block%20Extremist%20Websites.user.js)
- [old reddit redirect](https://update.greasyfork.org/scripts/528054/Reddit%20to%20Old%20Reddit%20Redirector.user.js)
- [YouTube Dual Subtitles](https://update.greasyfork.org/scripts/528053/YouTube%20Dual%20Subtitles%20for%20French%2C%20German%2C%20Russian%2C%20Ukrainian.user.js)

## YouTube Dual Subtitles

[Userscript (native language: English)](https://update.greasyfork.org/scripts/528708/YouTube%20Dual%20Subtitles%20for%20French%2C%20German%2C%20Russian%2C%20Ukrainian.user.js)

![image](https://github.com/user-attachments/assets/859a8f94-ea0e-481b-bc92-08fabc7b94a8)

Use `document.querySelector("#movie_player").getPlayerResponse()?.captions?.playerCaptionsTracklistRenderer?.captionTracks`

### Non-YouTube Method:

1. Download from VK Video/Rutube/1tv/Dzen/Telegram
2. Use [Google Cloud transcription](https://cloud.google.com/speech-to-text/docs/async-time-offsets)
3. Process it into correct format and add parameters:
   - `&fmt=vtt`
   - `&fmt=vtt&tlang=en`

### For VK

Do this

```
document.getElementById('vk_external_ru_0');
```

Example URL:

```
https://vk6-3.vkuser.net/?srcIp=23.249.17.195&expires=1740331494117&srcAg=CHROME&fromCache=1&ms=95.142.206.162&mid=9213755271337&type=2&ix=0&subId=7900018182825&sig=R3htBkUoap4&ct=13&urls=185.226.55.155%3B185.226.53.140&clientType=13&appId=512000384397&zs=43&id=7900018182825
```

```
https://vkvd216.okcdn.ru/?srcIp=182.255.32.15&expires=1741518261109&srcAg=CHROME&fromCache=1&ms=45.136.22.152&mid=9158459009161&type=2&ix=0&subId=7863983540873&sig=734uC02dO0Y&ct=13&urls=45.136.21.160&clientType=13&appId=512000384397&id=7863983540873
```

### Example YouTube Subtitles URLs:

**Russian (Original):**

```
https://www.youtube.com/api/timedtext?v=6ytmu8BN8iI&ei=lEm0Z9ODOMKMvcAPmZukmQc&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1739893764&sparams=ip,ipbits,expire,v,ei,caps,opi,xoaf&signature=66237522F7C96BE2CAB01C096EF4D94C40D108CA.73DCA9268447F4BE6E796256D9CA6EEA1A893D30&key=yt8&kind=asr&lang=ru&fmt=vtt
```

**English (Translated):**

```
https://www.youtube.com/api/timedtext?v=6ytmu8BN8iI&ei=lEm0Z9ODOMKMvcAPmZukmQc&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1739893764&sparams=ip,ipbits,expire,v,ei,caps,opi,xoaf&signature=66237522F7C96BE2CAB01C096EF4D94C40D108CA.73DCA9268447F4BE6E796256D9CA6EEA1A893D30&key=yt8&kind=asr&lang=ru&fmt=vtt&tlang=en
```

### Sample VTT Format:

```vtt
Сигма<00:00:02.320><c> Сигма</c><00:00:02.840><c> бой</c><00:00:03.240><c> Сигма</c><00:00:03.800><c> бой</c><00:00:04.200><c> Сигма</c><00:00:04.759><c> бой</c>

00:00:05.710 --> 00:00:05.720 align:start position:0%
Сигма Сигма бой Сигма бой Сигма бой


00:00:05.720 --> 00:00:09.470 align:start position:0%
Сигма Сигма бой Сигма бой Сигма бой
каждая<00:00:06.399><c> Девчонка</c><00:00:07.080><c> хочет</c><00:00:07.560><c> танцевать</c><00:00:08.280><c> с</c><00:00:08.480><c> тобой</c>

00:00:09.470 --> 00:00:09.480 align:start position:0%
каждая Девчонка хочет танцевать с тобой


00:00:09.480 --> 00:00:13.629 align:start position:0%
каждая Девчонка хочет танцевать с тобой
Сигма<00:00:10.000><c> Сигма</c><00:00:10.480><c> бой</c><00:00:10.920><c> Сигма</c><00:00:11.440><c> бой</c><00:00:11.880><c> Сигма</c><00:00:12.400><c> бой</c><00:00:13.360><c> я</c>

00:00:13.629 --> 00:00:13.639 align:start position:0%
Сигма Сигма бой Сигма бой Сигма бой я


00:00:13.639 --> 00:00:17.109 align:start position:0%
Сигма Сигма бой Сигма бой Сигма бой я
такая<00:00:14.200><c> всё</c><00:00:14.519><c> Что</c><00:00:14.799><c> добиваться</c><00:00:15.599><c> будешь</c><00:00:16.320><c> год</c>

00:00:17.109 --> 00:00:17.119 align:start position:0%
такая всё Что добиваться будешь год
```

### Sample VTT and HTML Links:

- English: https://cdn.jimchen.me/d074ecc1601e593f5c695733ba7fc7c3&fmt=vtt&tlang=en
- Russian: https://cdn.jimchen.me/d074ecc1601e593f5c695733ba7fc7c3&fmt=vtt
- HTML: https://cdn.jimchen.me/9e4ff80fe4ba47505319aa075fc878a2/example.html
