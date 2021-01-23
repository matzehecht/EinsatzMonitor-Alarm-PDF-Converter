# EinsatzMonitor-Alarm-PDF-Converter

## Dokumentation

*Toolset für den [EinsatzMonitor der Feuer Software GmbH](https://feuersoftware.com/einsatzmonitor/).*  
*Bei Fragen erreicht ihr mich in dem ihr ein `Issue` erstellt oder per Mail [`dev@hecht.space`](mailto:dev@hecht.space?subject=[EMAPC]%20Deine%20Frage).*

Der EMAPC (EinsatzMonitor-Alarm-PDF-Converter) bietet ein Toolset zur Konvertierung einer eingehenden Alarm-PDF in ein Format, das vom EinsatzMonitor lesbar ist.
Dieses Tool extrahiert die relevanten Informationen der Alarm-PDF in eine schlüssel-wert-formatierte Datei, die durch die Mustererkennung des EinsatzMonitors gelesen werden kann.  

### Mitarbeit

Möchtest du mit an emapc arbeiten? Zögere nicht, Fehler zu melden oder Feature-Anfragen zu stellen. Bitte nutze dazu die Issues-Funktion.  
Du kannst mir auch gerne bei der Implementierung dieses Tools helfen. Erstelle hierzu ein fork diese Repos -> Arbeite auf diesem Fork und stelle mir dann einen PR ein.  
Stelle sicher, dass du den aktuellen Status des `main`-Branches verwendest, bevor du einen Merge anforderst.  
Halte dich bei den commit messages bitte an die [conventional commits](https://www.conventionalcommits.org/de/v1.0.0/).

### Du willst EMAPC verwenden?

Kein Problem. Es gibt keine Einschränkungen für die Verwendung dieses Projekts.  
Wenn du etwas Feedback hast: Bitte erstellen ein Issue und füge das Label `Feedback` hinzu.  
Wenn du noch etwas anderes zu diesem Projekt sagen willst: Erstelle ein Issue und füge das Label `Hi` hinzu.

### INSTALLATION

Das Tool kann auf der [Release-Seite](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/releases) heruntergeladen werden.  
Dort kann die Binärdateien und Installationsskripte für jedes Release gefunden werden (in der Dropdown-Liste Assets). Emapc unterstützt Linux (32-Bit [x86] und 64-Bit [x64]), Windows (32-Bit [x86] und 64-Bit [x64]) und Mac (64-Bit).  
Für jede unterstützte Architektur gibt es das Kommandozeilen-Tool (cli-tool) und die Dienst-Binärdatei.  
Erstere wird zur einmaligen Verarbeitung der Eingabe verwendet. Wenn das Tool alle Eingaben verarbeitet hat, wird es beendet.  
Das zweite läuft, bis es händisch gestoppt wird. Es überwacht das angegebene Verzeichnis und verarbeitet jede Datei, die in das Verzeichnis gelegt wird.

Auf der Release-Seite befinden sich auch ein Installationsprogramm für Windows und Linux (32-Bit und 64-Bit). In dem Installationsprogramm für Windows (.msi-Datei) sind alle Abhängigkeiten enthalten. Beim Ausführen des Skripts werden diese im Installationsordner (`C:\Program Files\EMAPC`) abgelegt. Hierzu gehört auch die Konfigurationsdatei (`C:\Program Files\EMAPC\emapc.conf.yml`). Die Beispielkonfigurationsdatei (`C:\Program Files\EMAPC\example.conf.yml`) sollte nicht verändert werden um bei updates die neue Standardkonfiguration zu erhalten. Weiter wird der `Einsatzmonitor-Alarm-PDF-Converter`-Dienst in den Windows Diensten installiert und kann hier gestoppt un gestartet werden (zu finden unter: `Win + R` -> services.msc -> `ENTER`). Dieser Dienst startet nach Neustarts oder Crashes des Computers automatisch. EMAPC kann in den Windows `Programme und Features` deinstalliert werden. (Der Windows Installer unterstützt zur Zeit nur den Dienst, nicht das Kommandozeilentool).

Das Installationsskript für Linux lädt auch ein Deinstallationsskript herunter. Es befindet sich ebenfalls in `/usr/local/emapc`. Das Skript deinstalliert und entfernt alle Komponenten des Kommandozeilen-Tools und des Dienstes.

### VERWENDUNG

#### Dienst

Der Dienst verwendet eine Konfigurationsdatei, die im Arbeitsverzeichnis abgelegt wird und den Namen `emapc.conf.yml` hat. Der Installer legt das Arbeitsverzeichnis auf `/usr/local/emapc/` bzw. `C:\Program Files\EMAPC` fest. Der Installer lädt außerdem eine Standardkonfiguration.  
Die Konfiguration wird [unten](#konfiguration) erklärt.

> **HINWEIS:** Da emapc Standard-Betriebssystem-Dienste verwendet, können Standard-Betriebssystem-Tools verwendt werden, um diesen Dienst zu verwalten. Auf Windows kann der Dienstmanager verwendet werden. Auf Windows verwendet emapc nssm als Wrapper, so dass auch nssm-Befehle verwendet werden können. [Weitere Informationen](http://nssm.cc/). Der Installer enthält auch die ausführbare nssm-Datei (zu finden unter `/usr/local/emapc/` oder `C:\Program Files\EMAPC`).

##### Verwendung mit dem Einsatzmonitor

Für die Verwendung mit dem Einsatzmonitor müssen ein paar Einstellungen im Einsatzmonitor gemacht werden. Alle der folgenden Einstellungen befinden sich in den Auswertungs-Einstellungen (Menü unten links -> Auswertung).

0. EinsatzMonitor-Alarm-PDF-Converter (EMAPC) und der Einsatzmonitor sollte schon installiert sein.
1. Um die Alarme über E-Mail zu empfangen muss unter E-Mail der entsprechende Mail-Server eingerichtet werden. Zusätzlich müssen "Download Anhang" und "Nur Anhang" aktiviert werden und unter "Anhang Speicherort" der Ordner `C:\Program Files\EMAPC\input` angegeben werden.
2. Als nächstes muss unter "File Überwachung" der Schalter umgelegt werden. Nun sollte der Einsatzmonitor neugestartet werden.
3. Jetzt muss die Konfiguration von EMAPC angepasst werden. Notwendig ist hierbei lediglich die Anpassung des Ausgabeordners (`service -> output`). Dieser muss zu `/Users/<Nutzername>/Einsatz_Monitor/Text_Input/` geändert werden (Nutzername sollte der Nutzer des Einsatzmonitor sein).
4. EMAPC gibt eine Textdatei mit einem festen Format (in der Konfiguration definiertem) aus. Dieses Format muss nun unter "Pattern" eingepflegt werden (Beispiel unten).
5. Letztlich muss unter "AAO-Auswertung" der Separator ";" und das Pattern "{{FUNKRUFNAME}}" eingetragen werden.

Pattern:

```txt
Meldebild:{{EINSATZSTICHWORT}}
Ort:{{ORT}}
Ortsteil:{{ORTSTEIL}}
Straße:{{STRASSE}}
Ortszusatz:{{ZUSATZFELD2:Zusatzinformation}}
Sondersignal:{{ZUSATZFELD1:Sondersignal}}
Bemerkung:{{ZUSATZFELD2:Bemerkung}}
Stichwort 2:{{ZUSATZFELD1:Stichwort}}
Stichwort:{{ZUSATZFELD3:Bemerkung}}
Einsatzmittel:{{AAO}}
```

#### CLI

`emapc --config konfigurationsDateiPfad eingabeDateiOderOrdner ausgabeDateiOderOrdner`

##### NOTWENDIGE ARGUMENTE

- **eingabeDateiOderOrdner:**  
  Dies muss ein gültiger Pfad zu einer PDF-Datei sein. (Die Alarm-PDF-Datei).  
  Oder dies kann ein Pfad zu einem Ordner sein. In diesem Fall wird emapc alle PDF-Dateien in diesem Ordner verarbeiten.

- **ausgabeDateiOderOrdner:**  
  Dies kann der Pfad zu einer *(noch nicht existierenden)* Ausgabedatei sein.  
  > In diesem Fall verwendet emapc den angegebenen Dateinamen.  

  **\- ODER -**  
  Dies kann der Pfad zu einem bestehenden Verzeichnis sein.  
  > In diesem Fall übernimmt emapc den Dateinamen aus der Eingabe.

- **--config** *<Pfad/zur/Konfiguration/Datei.json>*  
  Diesem Parameter sollte ein gültiger Pfad zu einer benutzerdefinierten Konfigurationsdatei folgen.  

### Wie es funktioniert

Unabhängig davon, ob das Kommandozeilentool oder den Dienst verwendet wird, wird emapc durch eine Konfigurationsdatei konfiguriert. In dieser kann angeben werden, welche Eingaben erwartet werden, was in der Ausgabe stehen soll und einige zusätzliche Dinge. Die Konfiguration wird [später](#konfiguration) erklärt.
Wie oben erwähnt verwendet emapc PDF-Dateien als Eingabe. Das Tool iteriert über alle Dateien, die als Input angegeben wurden (entweder als Argument oder in der Konfiguration).  
Nach einiger Initialisierung (wie dem Parsen der Eingabeargumente und der Konfiguration) wird jede Eingabedatei einzeln verarbeitet.  
EMAPC verwendet das `pdftotext` Kommandozeilen-Tool des [xpdf Projekts](https://www.xpdfreader.com/). Dieses Tool ist im Installer enthalten, so dass emapc vollständig `battery-included` ist (alle Abhängigkeiten werden mitgeliefert).  
Nun veratbeitet emapc diesen Text. Zuerst versucht emapc, einige spezielle Schlüssel (genannt `inText`-Schlüssel) zu extrahieren. Diese Schlüssel werden in der Konfiguration festgelegt, wie [unten](#konfiguration) beschrieben. Das Werkzeug sucht nach Zeilen, die einen der Spezialschlüssel enthalten. Für jeden Spezialschlüssel werden alle gefundenen Zeilen verkettet und gespeichert (und später bei der Ausgabe verwendet). Die gefundenen Zeilen werden in den nächsten Schritten nicht mehr beachtet.  
Emapc wird die nächsten Schritte für jeden Abschnitt (in der Konfiguration angegeben) einzeln durchführen.  
Der erste dieser Schritte besteht darin, festzustellen, wo die Abschnitte beginnen. Hierfür wird nach Zeilen mit dem angegebenen Schlüsselwort gesucht. Für Abschnitte, die sich über mehrere Seiten erstrecken, gibt es mehrere Zeilen mit dem Schlüsselwort. Emapc behandelt sie als Unterabschnitte und führt sie später zusammen.  
Das Ende eines (Unter-)Abschnitts wird durch eine Leerzeile (Zeile mit nur Leerzeichen, Tabulatoren oder einer leeren Zeichenfolge) erkannt.  
Nun werden Abschnitte, die ein tabellenartiges Format haben, anders verarbeitet als Abschnitte, die einen Schlüsselwert ähnliches Format haben (das Format wird in der Konfiguration angegeben).  
Aber zuerst versucht emapc, das Format des Abschnitts zu erraten, sofern der Typ des Abschnitts auf `try` gesetzt ist. Emapc rät, indem es schaut, ob die Zeile mit dem Schlüsselwort mit einigen Leerzeichen (Leerzeichen oder Tabulatoren) beginnt. Wenn dies der Fall ist, wirg angenommen, dass der Abschnitt eine Tabelle ist, andernfalls wird angenommen, dass es sich um ein Schlüsselwertformatähnlichen Abschnitt handelt *(vielleicht sollte dieser Test anders gemacht werden)*.  

Zu der Verarbeitung der Schlüsselwert-Abschnitte: Emapc durchläuft die Zeilen dieses Abschnitts in einer Schleife. Für jede Zeile wird der Schlüssel extrahiert, indem nach dem ersten Vorkommen von zwei Leerzeichen hintereinander gesucht und dann den Text davor genommen. Anschließend wird der Wert in der gleichen Zeile extrahiert. Dazu nimmt emapc den Text zwischen den ersten beiden Leerzeichen aufeinander folgenden Leerzeichen und dem zweiten Vorkommen davon. Dieser Text ist der extrahierte Wert. Der gesamte Text, der sich nach dem zweiten Auftreten von zwei aufeinanderfolgenden Leerzeichen befindet, wird später als 'restlicher Text' behandelt. Jetzt behandelt emapc die Zeilen unterhalb der aktuellen Zeile. Erst versucht emapc zu erkennen, ob der Text in diesen Zeilen Teil des aktuellen Wertes sein sollte. Hierzu wird geprüft, ob diese Zeilen mit einigen Leerzeichen beginnen (Es werden alle folgenden Zeilen angeschaut, bis eine mit einem neuen Schlüssel gefunden wird). Die gefundenen Werte werden verkettet. Schließlich betrachtet emapc den (oben erwähnten) restlichen Text. Hierbei schaut emapc, ob dieser Text mit einem ähnlichen Format wie der aktuelle Schlüssel beginnt oder andere bekannte Schlüsselwörter (wie 'Datum:') verwendet. Wenn ja hängt emapc diesen Text als separate Schlüsselwerte an.

Zu den tabellenähnlichen Abschnitten: Hier schaut emapc auf die erste Zeile. Es wird angenommen, dass in dieser Zeile die Spaltenüberschriften stehen. Emapc vesucht den Text der jeweiligen Kopfzeile und den zugehörigen Startindex zu extrahieren. Es wird davon ausgegangen, dass die jeweilige Spalte in allen Zeilen am gleichen Startindex (+- 2) beginnt. Weiter wird davon ausgegangen, dass die Spaltenüberschriften durch mindestens zwei Leerzeichen getrennt sind. Falls die erste Spalte keine Überschrift enthält (z.B. bei Tabellen mit Zeilenüberschriften), fügt emapc eine leere Überschrift und den dazu gehörigen Index (0) ein. Nach dem Extrahieren der Spaltenüberschriften iteriert emapc über die folgenden Zeilen und versucht, die Werte jeder Spalte für die jeweilige Zeile durch den erkannten Spaltenstartindex und den Startindex der nächsten Spalte zu extrahieren.

Emapc schreibt nun das Ergebnis in eine Textdatei im Schlüsselwertformat.  
Zum Schreiben iteriert emapc über alle Ausgabeschlüssel (festgesetzt in [configuration](#configuration)). Dies stellt sicher, dass die Ausgabedatei für jeden Durchlauf das gleiche Format hat (natürlich ändern sich die Daten für verschiedene Eingaben).  
Die Ausgabe wird in einem schlüsselwertähnlichen Format geschrieben. Jede Zeile enthält ein neues Schlüsselwertpaar. Der Schlüssel und der Wert werden mit dem konfigurierten keyValueSeparator (Standard: `: `) getrennt.  
Wenn es sich bei dem Schlüssel um einen Schlüssel handelt, der mehrere Werte enthält, werden alle Werte in dieser Zeile ausgegeben, getrennt durch das konfigurierte Trennzeichen (Voreinstellung: `;`).  
Optional kann emapc ein Präfix und ein Suffix zu einem Wert hinzufügen (ein Suffix und/oder ein Präfix pro Schlüssel-Wert-Paar).  
Beispiel:

```txt
# ein Wert
Meldebild=TH Ölspur
# mehrere Werte
Einsatzmittel=FW1/1;FW1/2
```

**WICHTIG:** Wenn irgendein Schritt der Konvertierung fehlschlägt, schreibt empac den Rohtext der Eingabe-PDF in die Ausgabe-Textdatei!

### Konfiguration

Für emapc ist die Konfiguration erforderlich. Die Konfiguration wird in einer [yaml](https://de.wikipedia.org/wiki/YAML)-Datei vorgenommen. Eine Beispielkonfiguration ist [hier](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/blob/main/emapc.conf.yml) zu finden (Das Beispiel sollte für Feuerwehren im Landkreis Biberach funktionieren).  

Die Konfiguration gliedert sich grundsätzlich in 3 Teile: `Input`, `Output` und einen optionalen `Service` Teil. Der Dienst-Teil (`service`) ist erforderlich, wenn emapc als Dienst/Service betrieben wird.  

Der Input-Teil sagt emapc, wie die Eingabedateien in etwa aussehen werden. Dazu werden die erwarteten (Eingabe-)Abschnitte und spezielle 'inTextKeys' angegeben. Die inTextKeys sind eine Liste von speziellen Schlüssel (sie werden [oben](#wie-es-funktioniert) beschrieben). Die Abschnitts-Konfiguration andererseits ist eine Abbildung von Sektionsnamen (sollte das Sektions-Schlüsselwort/Header aus der Eingabedatei sein) auf den Sektionstyp. Erlaubte Typen sind `keyValue`, `table` und `try`, falls emapc versuchen sollte, den Typ zu erkennen (beschrieben [oben](#wie-es-funktioniert)).  
*Beispiel:*

```yaml
input:
  sections:
    Einsatzanlass: keyValue
    Einsatzort: try
    EM: table
  inTextKeys:
    - Sondersignal
```

Der Ausgabeteil gibt nun an, wie die Ausgabe aussehen soll. Er ordnet auch die extrahierten Eingabewerte den Ausgabeschlüsseln zu. Aber zuerst gibt der Ausgabeteil das Trennzeichen an, das zwischen dem Schlüssel und dem zugehörigen Wert verwendet wird (genannt "keyValueSeparator") und das Trennzeichen, das zwischen mehreren Werten verwendet wird (genannt "separator"). Beide genannten Konfigurationen sind optional (`keyValueSeparator` ist standardmäßig `: ` und `separator` ist standardmäßig `;`).  
Das letzte, was im Ausgabeteil angegeben wird, sind die Ausgabeschlüssel. Sie befinden sich unterhalb des Schlüssels `keys`. Die Ausgabeschlüssel sind etwas komplexer. Jeder Schlüssel ist eine Abbildung seines Namens (wird auch das sein, was in der Ausgabe als Schlüssel geschrieben wird) zu seiner Konfiguration. Jeder Ausgabeschlüssel muss angeben, zu welchem Eingabeabschnitt er gehört. Anmerkung: Die inText-Schlüssel gehören zum Abschnitt `inText`. Optional können die Ausgabeschlüssel einen Filter angeben. Dieser Filter wird benutzt, um zu bestimmen, ob ein Wert dieses Ausgabeschlüssels in der Ausgabe enthalten sein soll (wenn z.B. kein Auto mit der Nummer '00' ausgegeben werden soll: setze den `filter` auf '00'. Der Filter nimmt einen [RegExp](https://de.wikipedia.org/wiki/Regul%C3%A4rer_Ausdruck)). Außerdem kann jeder Schlüssel optional ein Präfix und/oder Suffix angeben. Dieses wird vor/nach dem Wert gedruckt. Letztlich kann jeder Schlüssel als erforderlich definiert werden (`required: true`). Falls für diesen Schlüssel kein Wert vorhanden ist schält emapc in den fallback modus und gibt den rohen Eingabetext (sieht wie die PDF aus) in die Ausgabe aus, so dass auch der Einsatzmonitor in den Fallbackmodus schalten kann.  
Jetzt wird es kompliziert: Wenn der Ausgabeschlüssel ein einfaches schlüsselwertähnliches Format hat, nimmt die Konfiguration eine Liste von Eingabeschlüsselwörtern (spezifiziert durch `inputKeyWords`). Emapc sucht nach diesen Eingabeschlüsseln in der angegebenen inputSection und führt sie für die Ausgabe zusammen. Dies kann verwendet werden, wenn die gleiche Information verschiedene Eingabeschlüssel für verschiedene Alarme haben kann.  
Wenn der Ausgabeschlüssel in einem Tabellenabschnitt oder einem Try-Abschnitt enthalten ist, muss ein anderes Format verwendet werden, um die Ausgabe zu spezifizieren. Hier gibt es mehrere Optionen. Wenn die Ausgabe alle Werte einer Spalte oder einer Zeile ausgeben soll, muss der `type` (`column` oder `row`) und das inputKeyWord, das den Zeilen- oder Spaltenkopf enthält, angegeben werden. Wenn ein Wert einer Zeile mit einem bestimmten Zeilenkopf ausgegeben werden soll, kann eine Liste von inputKeyWords (wie für den zuvor beschriebenen keyValue) und der columnIndex des Wertes angegeben werden. Last but not least: Wenn ein Wert einer bestimmten, durch einen Index spezifizierten Zeile ausgegeben werden soll, kann ein `rowIndex` und ein `columnIndex` angeben wrden.  
*Beispiel:*

```yaml
output:
  separator: ';'
  keyValueSeparator: ':'
  keys:
    # Beispiel für Schlüsselwert-Format - erforderlich mit einem Suffix und einem Präfix
    Meldebild:
      inputSection: Einsatzanlass
      required: true
      suffix: irgendwas dahinter
      prefix: irgendwas davor
      inputKeyWords:
        - Meldebild
    # Beispiel für Tabelle - alle Werte einer Spalte (mit einem Filter auf alles, was auf 1/00 oder 1-00 endet).
    Einsatzmittel:
      inputSection: EM
      type: 'column'
      inputKeyWord: EM        # Kann unterschiedlich zur inputSection sein für Spalten, die nicht die erste sind.
      filter: ^.*1(\/|-)00$
    # Beispiel für Tabelle - ein Wert einer Zeile spezifiziert mit Schlüsselwörtern
    Ortszusatz:
      inputSection: Einsatzort
      inputKeyWords:
        - Ortszusatz
        - Bemerkung
      index: 0
    # Beispiel für Tabelle - ein WErt angegeben mit Indizes
    Straße:
      inputSection: Einsatzort
      rowIndex: 1
      columnIndex: 0
```

Zuletzt: der Dienst-Abschnitt.  
Er gibt ein Eingabeverzeichnis, das Ausgabeverzeichnis und ein optionales Archivierungsverzeichnis an. Wenn letzteres angegeben wird: emapc verschiebt die Eingabedatei nach der Verarbeitung in das Archivverzeichnis.  
*Beispiel:*

```yaml
service:
  inputDir: ./input/
  archiveDir: ./archive/
  outputDir: ./output/
```

EMAPC unterstützt auf Windows momentan nur Ordner auf dem Windows-Laufwerk (typischerweise `C:\`). Diese können in folgenden Formaten angegeben werden:

- `/emapc/`
- `C:\emapc\`
- `\emapc\`
