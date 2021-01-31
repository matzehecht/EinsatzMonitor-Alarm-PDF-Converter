#!/bin/bash

function cleanup() {  
  if [ "$1" == "local" ]
  then
    echo "pausing..."
    read
  fi
  
  rm emapc.conf.yml
  mv emapc.conf.testbkp.yml emapc.conf.yml || true

  rm -r $output || true
  rm -r $archive || true
  rm -r $input || true
}

input="test/testinput/"
expectedinput="test/input/"
output="test/output/"
archive="./test/archive/"
expectedOutput1="./test/expectedOutput/test1/"
expectedOutput2="./test/expectedOutput/test2/"
numberTestFiles=$(ls $expectedinput | wc -l)

mv -f emapc.conf.yml emapc.conf.testbkp.yml || true

cp example.conf.yml emapc.conf.yml

sed -ri 's/^(.*inputDir: ).*$/\1.\/test\/testinput\//' emapc.conf.yml
sed -ri 's/^(.*outputDir: ).*$/\1.\/test\/output\//' emapc.conf.yml
sed -ri 's/^(.*archiveDir: ).*$/\1.\/test\/archive\//' emapc.conf.yml

rm -r $output || true
rm -r $archive || true
rm -r $input || true

mkdir $output
mkdir $archive
mkdir $input

find $expectedinput -maxdepth 1 -type f -exec cp {} $input \;

if [ "$1" == "local" ]
then
  node dist/service.js &
  servicePID=$!
else
  ./emapc-service &
  servicePID=$!
fi

echo "running service with pid $servicePID"

startTime=$(date +%s)
echo "starting test 1 at $startTime"

echo "testing $numberTestFiles files"

while (( $(ls $output | wc -l) < $numberTestFiles )) && (( $(( $(date +%s) - $startTime)) < 30 ))
do
  currentCount=$(ls $output | wc -l)
  echo "running  $(( $(date +%s) - $startTime)) secs"
  echo "found $currentCount files"
  sleep "1s"
done

kill $servicePID

diff=$(diff $expectedOutput1 $output)
diffCode=$?

if (( $diffCode != 0 ))
then
  echo "test1 failing"
  echo "-------------------------------------------------------------"
  echo $diff
  cleanup "$1"
  exit 1
fi

diffArchive=$(diff $expectedinput $archive)
diffCode=$?

if (( $diffCode != 0 ))
then
  echo "test1 archive failing"
  echo "-------------------------------------------------------------"
  echo $diffArchive
  cleanup "$1"
  exit 1
fi

find $archive -maxdepth 1 -type f -exec rm {} \;
find $output -maxdepth 1 -type f -exec rm {} \;
find $expectedinput -maxdepth 1 -type f -exec cp {} $input \;

sed -i '10,14d' emapc.conf.yml
sed -ri 's/^(.*)required: true$/\1default: ein standard wert/' emapc.conf.yml
sed -ri 's/^((.*)inputKeyWord: EM)$/\1\n\2default: ["Muster", "Max"]/' emapc.conf.yml

if [ "$1" == "local" ]
then
  node dist/service.js &
  servicePID=$!
else
  ./emapc-service &
  servicePID=$!
fi

echo "running service with pid $servicePID"

startTime=$(date +%s)
echo "starting test 1 at $startTime"

echo "testing $numberTestFiles files"

while (( $(ls $output | wc -l) < $numberTestFiles )) && (( $(( $(date +%s) - $startTime)) < 30 ))
do
  currentCount=$(ls $output | wc -l)
  echo "running  $(( $(date +%s) - $startTime)) secs"
  echo "found $currentCount files"
  sleep "1s"
done

kill $servicePID

diff=$(diff $expectedOutput2 $output)
diffCode=$?

if (( $diffCode != 0 ))
then
  echo "test2 failing"
  echo "-------------------------------------------------------------"
  echo $diff
  cleanup "$1"
  exit 1
fi

diffArchive=$(diff $expectedinput $archive)
diffCode=$?

if (( $diffCode != 0 ))
then
  echo "test2 archive failing"
  echo "-------------------------------------------------------------"
  echo $diffArchive
  cleanup "$1"
  exit 1
fi

echo "test successfull"

cleanup "$1"
