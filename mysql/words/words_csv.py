import csv

def main():
    fieldnames = ['word', 'points']
    word_rows = []

    csv_path = 'words.csv'
    paths = [
        {'path': 'C:/Users/Pro/Documents/easy.txt', 'points': 1}, 
        {'path': 'C:/Users/Pro/Documents/med.txt', 'points': 3},
        {'path': 'C:/Users/Pro/Documents/hard.txt', 'points': 5},
    ]

    for path in paths:
        read_file(path['path'], word_rows, path['points'])
         
    write_file(csv_path, fieldnames, word_rows)


def read_file(path, output_dest, points):
    with open(path, 'r') as in_file:
        word = ''
        isText = True
        while isText:
            # read by character
            char = in_file.read(1)
            if not char:
                isText = False

            if char.isspace():
                word_dict = {}
                word_dict['word'] = word
                word_dict['points'] = points
                output_dest.append(word_dict)
                word = ''
            elif not char == '\n':
             word += char

def write_file(path, header, rows):
    with open(path, 'w', encoding='UTF8', newline='') as out_file:
        writer = csv.DictWriter(out_file, fieldnames=header)
        writer.writeheader()
        writer.writerows(rows)

main()