# EinsatzMonitor-Alarm-PDF-Converter

> Click here for the [German documentation](#dokumentation).  
> Klicke hier für die [deutsche Dokumentation](#dokumentation).

## Documentation

The EMAPC (EinsatzMonitor-Alarm-PDF-Converter) provides a toolset to convert an incoming alarm PDF into a format that can be read by the EinsatzMonitor.
This tool extracts the relevant information of the alarm pdf into a key-value formated file that can be read by the pattern matching of the EinsatzMonitor.

### Contribute

Do you want to contribute? Don't hesitate to report bugs or send feature requests. Please use the issues function for that.  
You're also welcome if you want to help me to implement this tool. You only have to fork this repo -> code on that fork and then send me a PR.  
Please use the dev branch for new features and do not code on the master branch if it is not a hotfix.  
Be sure to use the current state of the parent branch (dev or master) before requesting a merge.

### Want to use it?

Yeah, I'm cool with that. There are no restrictions to use that project.  
If you do have some feedback: Please create an issue and add the label `feedback`.  
If you do want to say something else about that project: create an issue and add the label `Hi`.

### USAGE

`emapc [--config configFilePath] inputFileOrDir outFileOrDir`

#### MANDATORY ARGUMENTS

- **inputFileOrDir:**  
  This has to be a valid path to either a PDF file. (The alarm pdf file).  
  Or this can be a path to a folder. In this case emapc will process all pdf files in this folder.

- **outFileOrDir:**  
  This can be the path to a *(not-existing)* output file.  
  > In this case emapc will use the provided file name.  

  **\- OR -**  
  This can be the path to a existing directory.  
  > In this case emapc will take the file name from the input.

#### OPTIONAL ARGUMENTS

- **--config** *<path/to/config/file.json>*  
  This parameter should be followed by a valid path the a custom config file.  
  If not provided emapc will use the default config.

### How it works

As mentioned above emapc uses PDF files as input. It will iterate through the files given as input.  
After some initialization (like parsing the input arguments and the config) it will process each input file.  
EMAPC uses the pdftotext cli tool of the [xpdf project](https://www.xpdfreader.com/). This tool is included in the emapc binary so that emapc is fully battery-included.  
Now emapc will process this string. emapc will do the next steps for each section (specified in the config) individually.  
The first step is to detect where the section starts. Therefore it will search for lines with the specified key word. For sections that are stretched over multiple pages there will be multiple lines with the keyword. emapc will handle them as subsections and merge them later.  
The end of a section is detected by a blank line (line with only spaces, tabs or an empty string).
Now the processing will be different for sections that have an table like format than for section that have an key value like format.  
But first emapc will try to guess the format of the section if the type is set to `try`. It will do that by looking if the line with the key word starts with some blanks (spaces or tabs). If it does it will guess the section is a table, else it will guess it is a key value format *(maybe the guess should be done different)*.  

Let me first explain how key value sections are processed. Here emapc will loop through the lines of this section. For each line it will try to extract the key. It does this by looking for the first occurence of two blanks in a row and then taking the text to the left. Now emapc will try to extract the value in the same line. Therefor it will take the text between the first two blanks in a row and the second occurence of two blanks in a row. This text will be the value. All the text located after two occurrences of two blanks in a row will be handled later as 'restString'. First emapc will loop through the lines below the current line. Here it will try to detect if the text of these lines should be part of the current value by looking if these lines starts with some blanks (It stops with iterating over the following lines if it has found one with a new key). The found values are concatenated. Finally (for key value) it will look at the restString. Here it will try too look if it starts with a similar format like the current key or uses other well known key words (like 'Datum:'). If yes: emapc will append them as separate key values.

Now table sections. First emapc looks at the first line of this section it assumes that this line contains the column headers. It will try to extract the header text and the starting index of it. Later emapc will assume that this column will start on the same index (+- 2) in each row. Also emapc assumes that the column headers are seperated by at least two blanks. If the the first column does not contain a header (for tables with row headers for example) it will add a empty header and it's index (0). After extracting the column headers emapc will iterate over the following lines and tries to extract the values of each column for this row by the detected column start index and the start index of the next column.

This was the extraction process.  
emapc will now write the result back to a key value formatted text file.  
For writing emapc will first loop over all sections. For each section it will print a section header looking like that below followed by a empty line:

```txt
------------------
|  section name  |
------------------
```

If the section is a key value section it will then print all keys and the related value separated by `=`. example:

```txt
Meldebild=TH Ölspur Ohne Sondersignal
Datum=27.10.2019
Stichwort=- - F TH0 1 Trupp
```

If the section is a table like section the output format is a little bit different.  
For tables emapc will first print a line containing the column headers like in the example below. I've chosen this format because in many cases the first column acts like a row header.You can specify the separator used between the columns in the [configuration](#configuration) (default: `;`).

```txt
columns=header1;header2;header3;...
```

If desired emapc will now print the row headers (See example below). If the header of the first column was set (not empty) emapc will use it here as key, else emapc will use `rows` as key:

```txt
columnHeader1=rowHeader1;rowHeader1;rowHeader1;...
  -- OR --
rows=rowHeader1;rowHeader1;rowHeader1;...
```

After that line emapc will insert the rows in the same format but using the column values:

```txt
column1value=column2value;column3value;...
column1value=column2value;column3value;...
column1value=column2value;column3value;...
```

### Configuration

You can change the default configuration of the EMAPC by providing a JSON-file in a specified format.  
The path to config can be specified with the `--config` argument.

Currently the config only supports two configuration parts: The sections (in the input file) and the output (specifies the output format).  
The sections part takes an array of single sections. Each section takes a key and a type. Both properties are required.

- The key property is the key word which indicates the start of a new section ([how it works](#How-it-works)).
- The type property specifies if the section is a key value like format or a table like format or if it should try to detect the type ([how it works](#How-it-works)).

For the ouput part you can only config the output of tables. So the output part takes only the property table. This property is optional. It takes in turn the property columnSeparator. It is of type string and specifies the separator used to seperate the column values for a row in the output.  
The property takes also the property printRowHeaders, which is of type boolean. It indicates if the row headers (fist column) should be printed separatly (additional to it's default print location).

The default configuration is the following:  

```json
{
  "sections": [
    {
      "key": "Einsatzanlass",
      "type": "keyValue"
    },
    {
      "key": "Einsatzort",
      "type": "try"
    },
    {
      "key": "EM",
      "type": "table"
    }
  ],
  "output": {
    "table": {
      "columnSeparator": ";",
      "printRowHeaders": false
    }
  }
}

```

## Dokumentation

Der EMAPC (EinsatzMonitor-Alarm-PDF-Converter) bietet ein Toolset zur Konvertierung einer eingehenden Alarm-PDF in ein Format, das vom EinsatzMonitor lesbar ist.
Dieses Tool extrahiert die relevanten Informationen der Alarm-PDF in eine schlüssel-wert-formatierte Datei, die durch die Mustererkennung des EinsatzMonitors gelesen werden kann.  

### Mitarbeit

Möchtest du mit an emapc arbeiten? Zögere nicht, Fehler zu melden oder Feature-Anfragen zu stellen. Bitte nutze dazu die Issues-Funktion.  
Du kannst mir auch gerne bei der Implementierung dieses Tools helfen. Erstelle hierzu ein fork diese Repos -> Arbeite auf diesem Fork und stelle mir dann einen PR ein.  
Bitte nutze den dev-Branch für neue Features und arbeite nicht auf dem master-Branch, wenn du nicht an einem Hotfix arbeitest.  
Stelle sicher, dass du den aktuellen Status des übergeordneten Branches (dev oder master) verwendest, bevor du einen Merge anforderst.

### Willst du EMAPC verwenden?

Kein Problem. Es gibt keine Einschränkungen für die Verwendung dieses Projekts.  
Wenn du etwas Feedback hast: Bitte erstellen ein Issue und füge das Label `Feedback` hinzu.  
Wenn du noch etwas anderes zu diesem Projekt sagen willst: Erstelle ein Issue und füge das Label `Hi` hinzu.

### VERWENDUNG

`emapc [--config configFilePath] inputFileOrDir outFileOrDir`

##### NOTWENDIGE ARGUMENTE

- **inputFileOrDir:**  
  Dies muss ein gültiger Pfad zu einer PDF-Datei sein. (Die Alarm-PDF-Datei).  
  Oder dies kann ein Pfad zu einem Ordner sein. In diesem Fall wird emapc alle PDF-Dateien in diesem Ordner verarbeiten.

- **outFileOrDir:**  
  Dies kann der Pfad zu einer *(nicht existierenden)* Ausgabedatei sein.  
  > In diesem Fall verwendet emapc den angegebenen Dateinamen.  

  **\- ODER -**  
  Dies kann der Pfad zu einem bestehenden Verzeichnis sein.  
  > In diesem Fall übernimmt emapc den Dateinamen aus der Eingabe.

##### OPTIONALE ARGUMENTE

- **--config** *<Pfad/zur/Konfiguration/Datei.json>*  
  Diesem Parameter sollte ein gültiger Pfad zu einer benutzerdefinierten Konfigurationsdatei folgen.  
  Wenn nicht angegeben, verwendet emapc die Standardkonfiguration.

### Wie es funktioniert

Wie oben erwähnt verwendet emapc PDF-Dateien als Input. Es iteriert durch die als Input angegebenen Dateien.  
Nach der Initialisierung (wie das Parsen der Eingabeargumente und der Konfiguration) wird es jede Eingabedatei einzeln verarbeiten.  
emapc benutzt das pdftotext cli-Werkzeug des [xpdf projekts](https://www.xpdfreader.com/). Dieses Werkzeug ist in der emapc-Binärdatei enthalten, so dass emapc vollständig `battery-included` ist (alle Abhängigkeiten werden mitgeliefert).  
Nun wird emapc diesen Text verarbeiten. emapc wird die nächsten Schritte für jeden Abschnitt (Section) (in der Konfiguration spezifiziert) einzeln durchführen.  
Der erste Schritt besteht darin, festzustellen, wo der Abschnitt beginnt. Dazu wird smapc nach Zeilen mit dem angegebenen Schlüsselwort suchen. Für Abschnitte, die sich über mehrere Seiten erstrecken, wird es mehrere Zeilen mit dem Schlüsselwort geben. emapc wird sie als Unterabschnitte behandeln und später zusammenführen.  
Das Ende eines Abschnitts wird durch eine Leerzeile (Zeile mit nur Leerzeichen, Tabulatoren oder einer leeren Zeichenkette) erkannt.
Nun wird die Verarbeitung für Abschnitte, die ein tabellenartiges Format haben, anders sein als für Abschnitte, die einen Schlüssel-wert wie Format haben.  
Aber zuerst wird emapc versuchen, das Format des Abschnitts zu erraten, wenn der Typ auf `try` gesetzt ist. Das geschieht, indem es schaut, ob die Zeile mit dem Schlüsselwort mit einigen Leerzeichen oder Tabulatoren beginnt. Wenn dies der Fall ist, errät es, dass der Abschnitt eine Tabelle ist, andernfalls errät es, dass es sich um ein Schlüsselwertformat handelt *(vielleicht sollte die Vermutung anders gemacht werden)*.  

Zunächst wird nun erklärt, wie Schlüssel-wert-Abschnitte verarbeitet werden. Hier durchläuft emapc die Zeilen dieses Abschnitts in einer Schleife. Für jede Zeile versucht emapc, den Schlüssel zu extrahieren, indem es nach dem ersten Vorkommen von zwei Leerzeichen (oder tabs) in einer Reihe sucht und dann den Text links davon nimmt. Nun versucht emapc, den Wert in der gleichen Zeile zu extrahieren. Dazu nimmt es den Text zwischen den ersten beiden Leerzeichen in einer Reihe und dem zweiten Vorkommen von zwei Leerzeichen in einer Reihe. Dieser Text ist der Wert. Der gesamte Text, der sich nach dem zweiten Auftreten von zwei Leerzeichen in einer Reihe in der ZEile befindet, wird später als 'restString' behandelt. Zuerst durchläuft emapc die Zeilen unterhalb der aktuellen Zeile. Hier versucht emapc zu erkennen, ob der Text dieser Zeilen Teil des aktuellen Wertes sein soll, indem es betrachtet, ob die Zeile mit einigen Leerzeichen beginnt (es hört mit der Iteration über die folgenden Zeilen auf, wenn es eine Zeile mit einem neuen Schlüssel gefunden hat). Die gefundenen Werte werden verkettet. Schließlich (für die Schlüssel-wert-Abschnitte) schaut es sich den RestString an. Hier schaut emapc, ob der restString mit einem ähnlichen Format beginnt wie der aktuelle Schlüssel oder andere bekannte Schlüsselwörter (wie 'Datum:') verwendet. Wenn ja: emapc hängt den restString als separate Schlüssel-werte an.

Jetzt die Tabellenabschnitte. Zuerst schaut emapc auf die erste Zeile dieses Abschnitts und nimmt an, dass diese Zeile die Spaltenüberschriften enthält. Es versucht, den Spaltenüberschriftentext und den Startindex davon zu extrahieren. Später geht emapc davon aus, dass diese Spalte in jeder Zeile mit dem gleichen Index (+- 2) beginnt. Auch geht emapc davon aus, dass die Spaltenüberschriften durch mindestens zwei Leerzeichen getrennt sind. Wenn die erste Spalte keine Kopfzeile enthält (bei Tabellen mit Zeilenüberschriften bspw.), fügt es eine leere Spaltenüberschrift und den Index (0) hinzu. Nach dem Extrahieren der Spaltenköpfe iteriert emapc über die folgenden Zeilen und extrahiert, die Werte jeder Spalte für die entsprechende Zeile durch den erkannten Spaltenstartindex und den Startindex der nächsten Spalte.

Dies war der Extraktionsprozess.  
emapc schreibt nun das Ergebnis in eine Schlüssel-wert-formatierte Textdatei.  
Beim Schreiben geht emapc zunächst über alle Abschnitte. Für jeden Abschnitt gibt es einen Abschnittskopf aus, der wie der untenstehende aussieht, gefolgt von einer Leerzeile:

```txt
------------------
|  section name  |
------------------
```

Wenn es sich bei dem Abschnitt um einen Schlüssel-wert-Abschnitt handelt, werden dann alle Schlüssel und der zugehörige Wert durch `=` getrennt geschrieben:

```txt
Meldebild=TH Ölspur Ohne Sondersignal
Datum=27.10.2019
Stichwort=- - F TH0 1 Trupp
```

Wenn der Abschnitt ein tabellenartiger Abschnitt ist, ist das Ausgabeformat ein wenig anders.  
Für Tabellen gibt emapc zuerst eine Zeile mit den Spaltenüberschriften aus, wie im Beispiel unten.  
Ich habe dieses Format gewählt, weil es sich bei der ersten Spalte in vielen Fällen um die Zeilenüberschrift handelt. Das zwischen den Spalten verwendete Trennzeichen kann in der [Konfiguration](#Konfiguration) angeben werden (Standard: `;`).

```txt
header1=header2;header3;...
```

Falls gewünscht fügt emapc nun den Zeilenkopf ein (siehe folgendes Beispiel). Falls der Zeilenkopf der ersten Zeile gestzt war (nicht leer) nutzt emapc diesen als Schlüssel, ansonsten nutzt emapc `rows` als Schlüssel:

```txt
columnHeader1=rowHeader1;rowHeader1;rowHeader1;...
  -- OR --
rows=rowHeader1;rowHeader1;rowHeader1;...
```

Nach dieser Zeile fügt emapc die Zeilen im gleichen Format, aber mit den Spaltenwerten ein:

```txt
column1value=column2value;column3value;...
column1value=column2value;column3value;...
column1value=column2value;column3value;...
```

### Konfiguration

Die Standardkonfiguration von emapc kann geändert werden, indem eine JSON-Datei in einem bestimmten Format bereit gestellt wird.  
Der Pfad zur Konfiguration kann mit dem Argument `--config` angegeben werden.

Derzeit unterstützt die Konfiguration nur zwei Konfigurationsteile: Die Sektionen (in der Eingabedatei) und die Ausgabe (gibt das Ausgabeformat an).  
Der Sektionsteil besteht aus einem Array von einzelnen Sektionen. Jede Sektion nimmt einen Schlüssel und einen Typ an. Beide Eigenschaften sind erforderlich.

- Die Schlüsseleigenschaft ist das Schlüsselwort, das den Beginn einer neuen Sektion angibt ([Wie es funktioniert](#wie-es-funktioniert)).
- Die Typ-Eigenschaft gibt an, ob es sich bei dem Abschnitt um einen Schlüssel-wert-Format oder ein tabellenartiges Format handelt oder ob versucht werden soll, den Typ zu ermitteln ([Wie es funktioniert](#wie-es-funktioniert)).

Für den Ausgabeteil kann nur die Ausgabe von Tabellen konfiguriert werden. Der Ausgabeteil nimmt also nur die Eigenschaft Tabelle entgegen. Diese Eigenschaft ist optional. Sie nimmt wiederum die Eigenschaft columnSeparator an. Diese ist vom Typ String und gibt das Trennzeichen an, das zur Trennung der Spaltenwerte für eine Zeile in der Ausgabe verwendet wird.
Die Eigenschaft Tabelle nimmt außerdem die Eigenschaft printRowHeaders entgegen, welche den Typ Boolean hat. Diese zeigt an, ob der Zeilenkopf (die erste Spalte) zusätzlich nochmals separat ausgegeben werden soll.

Die Standardkonfiguration lautet wie folgt:  

```json
{
  "sections": [
    {
      "key": "Einsatzanlass",
      "type": "keyValue"
    },
    {
      "key": "Einsatzort",
      "type": "try"
    },
    {
      "key": "EM",
      "type": "table"
    }
  ],
  "output": {
    "table": {
      "columnSeparator": ";",
      "printRowHeaders": false
    }
  }
}
