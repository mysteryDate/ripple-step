import hashlib
import argparse

def max_int_from_string(string, max_val, current_value=''):
  if len(string) == 0:
    return int(current_value), string
  if int(current_value + string[0]) > max_val:
    return int(current_value), string

  return max_int_from_string(string[1:], max_val, current_value=current_value + string[0])

def main():
  parser = argparse.ArgumentParser()
  parser.add_argument(dest='input_word', action='store')
  parser.add_argument('-n', '--num-words', dest='num_words', type=int, default=3)
  args = parser.parse_args()

  dict_file = "word_list.txt"
  words = []
  with open(dict_file, 'r') as infile:
    for line in infile:
      words.append(line.rstrip("\n"))

  num_words = len(words)
  hex_digest = hashlib.sha1(str.encode(args.input_word)).hexdigest()
  int_digest = str(int(hex_digest, 16))
  hash_words = []

  while len(hash_words) < args.num_words:
    word_num, int_digest = max_int_from_string(int_digest, num_words)
    hash_words.append(words[word_num])

  result = '-'.join(hash_words)
  print(result)

if __name__ == '__main__':
  main()
