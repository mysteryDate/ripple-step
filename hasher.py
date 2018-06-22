import hashlib
import argparse
import textwrap

def load_dictionary(file_path):
  dictionary_words = []
  with open(file_path, 'r') as infile:
    for line in infile:
      dictionary_words.append(line.rstrip("\n"))
  return dictionary_words

def hash_to_words(input_word, num_words=3, dictionary=None):
  hex_digest = hashlib.sha1(str.encode(input_word)).hexdigest()
  int_digest = str(int(hex_digest, 16))
  indeces = textwrap.wrap(int_digest, len(int_digest) // num_words + 1)
  indeces = [int(x) % len(dictionary) for x in indeces]
  hash_words = [dictionary[x] for x in indeces]

  result = '-'.join(hash_words)
  return result, indeces

if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument(dest='input_word', action='store')
  parser.add_argument('-n', '--num-words', dest='num_words', type=int, default=3)
  args = parser.parse_args()
  result = hash_to_words(args.input_word, num_words=args.num_words, dictionary=load_dictionary("word_list.txt"))
  print(result)
