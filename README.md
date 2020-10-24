# EinsatzMonitor-Alarm-PDF-Converter

> Click here for the [German documentation](#dokumentation)  
> Klicke hier für die [deutsche Dokumentation](#dokumentation)  

## Documentation

The EMAPC (EinsatzMonitor-Alarm-PDF-Converter) provides a toolset to convert an incoming alarm PDF into a format that can be read by the EinsatzMonitor.
This tool extracts the relevant information of the alarm pdf into a key-value formated file that can be read by the pattern matching of the EinsatzMonitor.

### Contribute

Do you want to contribute? Don't hesitate to report bugs or send feature requests. Please use the issues function for that.  
You're also welcome if you want to help me to implement this tool. You only have to fork this repo -> code on that fork and then send me a PR.  
Be sure to use the current state of the `main` branch before requesting a merge.
For the commit messages: Please use the format defined in [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

### Want to use it?

Yeah, I'm cool with that. There are no restrictions to use that project.  
If you do have some feedback: Please create an issue and add the label `feedback`.  
If you do want to say something else about that project: create an issue and add the label `Hi`.

### INSTALLATION

You can download the tool on the [release page](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/releases).  
There you find the binaries and installers for each release (in the assets dropdown). Emapc supports linux (32-bit and 64-bit), windows (32-bit and 64-bit) and mac (64-bit).  
For each supported architecture you can find the cli binary and the runner binary.  
The former one is used to process the input one time. If the tool has processed all inputs, it will exit.  
The latter one will run until you stop it. It will watch the specified directory and process each file you paste in.

On the releases page you can also find an installer for windows and linux (32-bit and 64-bit). You can use this installer to download and place the binary and all dependencies.  
To get help with the installer you only have to call `./installer -h`.

**USAGE:** `installer <cli or srv>`  (***ATTENTION:** Please run the installer with root/elevated privileges*)  
You can call the installer with `cli` to download and place the cli-tool and the dependencies.  
If you call it with `srv` it will download and place the runner, the default config and the dependencies. It will also try to install an os service. It uses deamons on linux and native windows services with the help of nssm on windows.  

**NOTE:** Error messages may occur during installation. This does not mean that the installation fails. The installer just tries to delete all dependencies and binaries and download them again. The former fails if emapc was not installed before.  

### USAGE

#### CLI

`emapc --config configFilePath inputFileOrDir outFileOrDir`

##### MANDATORY ARGUMENTS

- **inputFileOrDir:**  
  This has to be a valid path to either a PDF file. (The alarm pdf file).  
  Or this can be a path to a folder. In this case emapc will process all pdf files in this folder.

- **outFileOrDir:**  
  This can be the path to a *(not-existing)* output file.  
  > In this case emapc will use the provided file name.  

  **\- OR -**  
  This can be the path to a existing directory.  
  > In this case emapc will take the file name from the input.

- **--config** *<path/to/config/file.json>*  
  This parameter should be followed by a valid path the a custom config file.

#### RUNNER

The runner uses a config file which is placed in the working directory and must have the name `emapc.conf.yml`. If you have used the installer the working directory is `/usr/local/emapc/` or `C:\emapc`. The installer includes a default config.  
The configuration is explained [below](#configuration).

> **NOTE:** Because emapc uses default os-services, you can use default os tools to manage this service. For windows you can use the servicemanager. On windows emapc uses nssm as a wrapper so you can also use their commands on windows. For more information look [here](http://nssm.cc/). The installer also includes he nssm executable (located in `/usr/local/emapc/` or `C:\emapc`).

### How it works

No matter if you use the cli or the runner tool, emapc is configured by a configuration file. In this you can specify what inputs you expect, what you want to be in the output and some additonal stuff. The configuration will be explained [later](#configuration).
As mentioned above emapc uses PDF files as input. It will iterate through the files given as input (either as argument or in the config).  
After some initialization (like parsing the input arguments and the config) it will process each input file.  
EMAPC uses the `pdftotext` cli tool of the [xpdf project](https://www.xpdfreader.com/). This tool is included in the installer so that emapc is fully battery-included.  
Now emapc will process this string. First emapc tries to extract some special keys (called `inText`-Key). These keys are specified in the configuration as described [below](#configuration). The tool searches for lines that includes one of the special keys. For each special key all found lines are concatenated and stored (and used by the output later). The found lines are ignored in the next steps.  
Emapc will do the next steps for each section (specified in the config) individually.  
The first of this steps is to detect where the section starts. Therefore it will search for lines with the specified key word. For sections that are stretched over multiple pages there will be multiple lines with the keyword. Emapc will handle them as subsections and merge them later.  
The end of a (sub-) section is detected by a blank line (line with only spaces, tabs or an empty string).  
Now the processing will be different for sections that have an table like format than for section that have an key value like format (Format is specified in configuration).  
But first emapc will try to guess the format of the section if the type is set to `try`. It will do that by looking if the line with the key word starts with some blanks (spaces or tabs). If it does, it will guess that the section is a table, else it will guess it is a key value format *(maybe the guess should be done different)*.  

Let me now explain how key value sections are processed. Here emapc will loop through the lines of this section. For each line it will try to extract the key. It does this by looking for the first occurence of two blanks in a row and then taking the text to the left. Now emapc will try to extract the value in the same line. Therefor it will take the text between the first two blanks in a row and the second occurence of two blanks in a row. This text will be the value. All the text located after two occurrences of two blanks in a row will be handled later as 'restString'. Now emapc will loop through the lines below the current line. Here it will try to detect if the text of these lines should be part of the current value by looking if these lines starts with some blanks (It stops with iterating over the following lines if it has found one with a new key). The found values are concatenated. Finally (for key value) it will look at the restString. Here it will try too look if it starts with a similar format like the current key or uses other well known key words (like 'Datum:'). If yes: emapc will append them as separate key values.

Now let us talk about table sections. First emapc looks at the first line of this section. It assumes that this line contains the column headers. It will try to extract the header text and the starting index of it. Later emapc will assume that this column will start on the same index (+- 2) in each row. Also emapc assumes that the column headers are seperated by at least two blanks. If the the first column does not contain a header (for tables with row headers for example) it will add a empty header and it's index (0). After extracting the column headers emapc will iterate over the following lines and tries to extract the values of each column for this row by the detected column start index and the start index of the next column.

emapc will now write the result back to a key value formatted text file.  
For writing emapc will loop over all output keys (specified in [configuration](#configuration)). This ensures that the output file has the same format for every run (of course the data is changing for different inputs).  
The output will be written in a key value like format. Each line contains a new key value pair. The key and the value will be seperated with the configured keyValueSeparator (default: `=`).  
If the key is a key that contains multiple values all values will be printed in this line separated by the configured separator (default: `;`).  
Optionally emapc can add a prefix and a suffix to a value (one suffix and/or one prefix per key value pair).  
Example:

```txt
# one value
Meldebild=TH Ölspur
# multiple values
Einsatzmittel=FW1/1;FW1/2
```

**IMPORTANT** If any step of the conversion fails, empac will print the raw text of the input pdf to the output text file!

### Configuration

For emapc the configuration is mandatory. The configuration is done in a [yaml](https://en.wikipedia.org/wiki/YAML) file. You can find an example configuration [here](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/blob/main/emapc.conf.yml) (The example should work for firefighters in the county of biberach).  

The configration is basically separated in 3 parts: `input`, `output` and a optional `runner` part. The runner part is mandatory if you want to run emapc as a service/runner.  

The input part says emapc how the input files will roughly look like. For that it specifies the expected (input) sections and what special 'inTextKeys' you expect to be in the file. The inTextKeys is a list of such keys (they're described [above](#how-it-works)). The sections configuration on the other hand is an mapping of section names (should be the section keyword/header from the input file) to the section type. Allowed types are `keyValue`, `table` and `try` if emapc should try to detect the type (described [above](#How-it-works)).  
*Example:*

```yaml
input:
  sections:
    Einsatzanlass: keyValue
    Einsatzort: try
    EM: table
  inTextKeys:
    - Sondersignal
```

The output part will now specify how the output should look like. It also maps the extracted input values to an output key. But first the output part specifies the separator used between the key and the related value (called `keyValueSeparator`) and the separator used between mutliple values (called `separator`). Both mentioned configurations are optional (`keyValueSeparator` defaults to `=` and `separator` defaults to `;`).  
The last thing specified in the output part are the output keys. They are located below the key `keys`. The output keys are little bit more complex. Each key is a mapping of it's name (will also be whats written in the output as key) to it's configuration. Each output key has to specify which input section it belongs to. Note: the inText keys are belonging to the section `inText`. Optionally the output keys can specify a filter. This filter will be used to determine if one value of this output key should be included in the output (for example you don't want to print cars with the number '00' in it then set `filter` to '00'. The filter takes an [RegExp](https://en.wikipedia.org/wiki/Regular_expression)). Also each key can optionally specify a prefix and/or suffix. This will be printed before/after the value.  
Now it's getting complex: If the output key will have a simple key value like format the configuration will take a list of input keywords (specified by `inputKeyWords`). Emapc looks for these input keys in the specified inputSection and merge them for the output. This can be used if the same information is can have different keys for different alarms.  
If the output key is contained in a table section or a try-section you have to use another format to specify the output. Here you have multiple options. If the output should print all values of a column or a row you should specify the `type` (`row` or `column`) and the inputKeyWord containing the row or column header. If you want to print one value of a row with a specific row header, you can specify a list of inputKeyWords (like for the keyValue described before) and the columnIndex of the value. Last but nor least: If you want to select one value of a specific row specified by an index, you can specify a `rowIndex` and a `columnIndex`.  
*Example:*

```yaml
output:
  separator: ';'
  keyValueSeparator: '='
  keys:
    # Example for keyValue format
    Meldebild:
      inputSection: Einsatzanlass
      suffix: something behind
      prefix: something in front
      inputKeyWords:
        - Meldebild
    # Example for table - all values of a column (with a filter for anything which ends with 1/00 or 1-00).
    Einsatzmittel:
      inputSection: EM
      type: 'column'
      inputKeyWord: EM        # Can be something different (compared to inputSection) for other columns than the first
      filter: ^.*1(\/|-)00$
    # Example for table - one value from a row specified with key words
    Ortszusatz:
      inputSection: Einsatzort
      inputKeyWords:
        - Ortszusatz
        - Bemerkung
      index: 0
    # Example for table - one value specified with indexes
    Straße:
      inputSection: Einsatzort
      rowIndex: 1
      columnIndex: 0
```

Lastly: the runner-section.  
it specifies an input directory, the output directory and an optional archive directory. If the latter one is given: emapc will move the input file to the archive directory after processing it.
*Example:*

```yaml
runner:
  inputDir: ./input/
  archiveDir: ./archive/
  outputDir: ./output/
```

## Dokumentation

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

Sie können das Tool auf der [Release-Seite](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/releases) herunterladen.  
Dort finden Sie die Binärdateien und Installationsskripte für jedes Release (in der Dropdown-Liste Assets). Emapc unterstützt Linux (32-Bit und 64-Bit), Windows (32-Bit und 64-Bit) und Mac (64-Bit).  
Für jede unterstützte Architektur finden Sie die Cli-Binärdatei und die Runner-Binärdatei.  
Erstere wird zur einmaligen Verarbeitung der Eingabe verwendet. Wenn das Tool alle Eingaben verarbeitet hat, wird es beendet.  
Das zweite läuft, bis Sie es stoppen. Es überwacht das angegebene Verzeichnis und verarbeitet jede Datei, die in das Verzeichnis gelegt wird.

Auf der Release-Seite finden Sie auch Installationsskripte für Windows und Linux (32-Bit und 64-Bit). Sie können diesen Installer verwenden, um die Binärdatei und alle Abhängigkeiten herunterzuladen und zu platzieren.  
Um Hilfe mit dem Installationsprogramm zu erhalten, müssen Sie nur `./installer -h` aufrufen.

**VERWENDUNG:** `installer <cli or srv>`  (***ACHTUNG:** Bitte führe den insaller mit Admin-Rechten aus*)  
Sie können den Installer mit `cli` aufrufen, um das Cli-Tool und alle Abhängigkeiten herunterzuladen und zu platzieren.  
Wenn Sie den Installer mit `srv` aufrufen, wird das Runner-Tool, die Standardkonfiguration und alle Abhängigkeiten heruntergeladen und platziert. Außerdem wird versucht, einen Betriebssystemdienst zu installieren. Auf Linux werden deamon und auf Windows native Dienste mit Hilfe von nssm verwendet.  

**NOTIZ:** Während der Installation können Fehlermeldungen auftreten. Das heißt nicht, dass die Installation fehlschlägt. Der Installer versucht nur alle Abhängigkeiten und Binärdateien zu löschen und neu herunterzuladen. Ersteres schläägt fehl, wenn emapc zuvor nicht installiert war.  

### VERWENDUNG

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

#### RUNNER

Der Runner verwendet eine Konfigurationsdatei, die im Arbeitsverzeichnis abgelegt wird und den Namen `emapc.conf.yml` hat. Der Installer legt das Arbeitsverzeichnis auf `/usr/local/emapc/` bzw. `C:\emapc` fest. Der Installer lädt außerdem eine Standardkonfiguration.  
Die Konfiguration wird [unten](#konfiguration) erklärt.

> **HINWEIS:** Da emapc Standard-Betriebssystem-Dienste verwendet, können Standard-Betriebssystem-Tools verwendt werden, um diesen Dienst zu verwalten. Auf Windows kann der Dienstmanager verwendet werden. Auf Windows verwendet emapc nssm als Wrapper, so dass auch nssm-Befehle verwendet werden können. [Weitere Informationen](http://nssm.cc/). Der Installer enthält auch die ausführbare nssm-Datei (zu finden unter `/usr/local/emapc/` oder `C:\emapc`).

### Wie es funktioniert

Unabhängig davon, ob Sie das Cli- oder das Runner-Tool verwenden, wird emapc durch eine Konfigurationsdatei konfiguriert. In dieser können Sie angeben, welche Eingaben Sie erwarten, was Sie in der Ausgabe haben wollen und einige zusätzliche Dinge. Die Konfiguration wird [später](#konfiguration) erklärt.
Wie oben erwähnt verwendet emapc PDF-Dateien als Eingabe. Das Tool iteriert über alle Dateien, die als Input angegeben wurden (entweder als Argument oder in der Konfiguration).  
Nach einiger Initialisierung (wie dem Parsen der Eingabeargumente und der Konfiguration) wird jede Eingabedatei einzeln verarbeitet.  
EMAPC verwendet das `pdftotext` cli-Tool des [xpdf Projekts](https://www.xpdfreader.com/). Dieses Tool ist im Installer enthalten, so dass emapc vollständig `battery-included` ist (alle Abhängigkeiten werden mitgeliefert).  
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
Die Ausgabe wird in einem schlüsselwertähnlichen Format geschrieben. Jede Zeile enthält ein neues Schlüsselwertpaar. Der Schlüssel und der Wert werden mit dem konfigurierten keyValueSeparator (Standard: `=`) getrennt.  
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

Die Konfiguration gliedert sich grundsätzlich in 3 Teile: `Input`, `Output` und einen optionalen `Runner` Teil. Der Runner-Teil ist erforderlich, wenn emapc als Dienst/Runner betrieben wird.  

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

Der Ausgabeteil gibt nun an, wie die Ausgabe aussehen soll. Er ordnet auch die extrahierten Eingabewerte den Ausgabeschlüsseln zu. Aber zuerst gibt der Ausgabeteil das Trennzeichen an, das zwischen dem Schlüssel und dem zugehörigen Wert verwendet wird (genannt "keyValueSeparator") und das Trennzeichen, das zwischen mehreren Werten verwendet wird (genannt "separator"). Beide genannten Konfigurationen sind optional (`keyValueSeparator` ist standardmäßig `=` und `separator` ist standardmäßig `;`).  
Das letzte, was im Ausgabeteil angegeben wird, sind die Ausgabeschlüssel. Sie befinden sich unterhalb des Schlüssels `keys`. Die Ausgabeschlüssel sind etwas komplexer. Jeder Schlüssel ist eine Abbildung seines Namens (wird auch das sein, was in der Ausgabe als Schlüssel geschrieben wird) zu seiner Konfiguration. Jeder Ausgabeschlüssel muss angeben, zu welchem Eingabeabschnitt er gehört. Anmerkung: Die inText-Schlüssel gehören zum Abschnitt `inText`. Optional können die Ausgabeschlüssel einen Filter angeben. Dieser Filter wird benutzt, um zu bestimmen, ob ein Wert dieses Ausgabeschlüssels in der Ausgabe enthalten sein soll (wenn z.B. kein Auto mit der Nummer '00' ausgegeben werden soll: setze den `filter` auf '00'. Der Filter nimmt einen [RegExp](https://de.wikipedia.org/wiki/Regul%C3%A4rer_Ausdruck)). Außerdem kann jeder Schlüssel optional ein Präfix und/oder Suffix angeben. Dieses wird vor/nach dem Wert gedruckt.  
Jetzt wird es kompliziert: Wenn der Ausgabeschlüssel ein einfaches schlüsselwertähnliches Format hat, nimmt die Konfiguration eine Liste von Eingabeschlüsselwörtern (spezifiziert durch `inputKeyWords`). Emapc sucht nach diesen Eingabeschlüsseln in der angegebenen inputSection und führt sie für die Ausgabe zusammen. Dies kann verwendet werden, wenn die gleiche Information verschiedene Eingabeschlüssel für verschiedene Alarme haben kann.  
Wenn der Ausgabeschlüssel in einem Tabellenabschnitt oder einem Try-Abschnitt enthalten ist, muss ein anderes Format verwendet werden, um die Ausgabe zu spezifizieren. Hier gibt es mehrere Optionen. Wenn die Ausgabe alle Werte einer Spalte oder einer Zeile ausgeben soll, muss der `type` (`column` oder `row`) und das inputKeyWord, das den Zeilen- oder Spaltenkopf enthält, angegeben werden. Wenn ein Wert einer Zeile mit einem bestimmten Zeilenkopf ausgegeben werden soll, kann eine Liste von inputKeyWords (wie für den zuvor beschriebenen keyValue) und der columnIndex des Wertes angegeben werden. Last but not least: Wenn ein Wert einer bestimmten, durch einen Index spezifizierten Zeile ausgegeben werden soll, kann ein `rowIndex` und ein `columnIndex` angeben wrden.  
*Beispiel:*

```yaml
output:
  separator: ';'
  keyValueSeparator: '='
  keys:
    # Beispiel für Schlüsselwert-Format
    Meldebild:
      inputSection: Einsatzanlass
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

Zuletzt: der Runner-Abschnitt.  
Er gibt ein Eingabeverzeichnis, das Ausgabeverzeichnis und ein optionales Archivierungsverzeichnis an. Wenn letzteres angegeben wird: emapc verschiebt die Eingabedatei nach der Verarbeitung in das Archivverzeichnis.
*Beispiel:*

```yaml
runner:
  inputDir: ./input/
  archiveDir: ./archive/
  outputDir: ./output/
```
