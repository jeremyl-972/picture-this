All the words are stored in the words table in the AWS RDS database.

The words were copied as text from a website into three text files on my hard drive
(
    C:/Users/Pro/Documents/easy.txt
    C:/Users/Pro/Documents/med.txt
    C:/Users/Pro/Documents/hard.txt
).

I then wrote a Python script to to convert those all the words from those three files into one csv file (words.csv).

I used an online coverter to convert the csv file into an SQL script (words.sql) for inserting the words since AWS RDS does not support importing files.