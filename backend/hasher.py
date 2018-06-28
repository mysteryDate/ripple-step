import hashlib
import argparse
import textwrap

def load_dictionary(file_path):
  dictionary_words = []
  with open(file_path, 'r') as infile:
    for line in infile:
      dictionary_words.append(line.rstrip("\n"))
  return dictionary_words

def hash_to_words(input_word, num_words, dictionary):
  hex_digest = hashlib.sha1(str.encode(input_word)).hexdigest()
  hex_indeces = textwrap.wrap(hex_digest, len(hex_digest) // num_words + 1)
  indeces = [int(x, 16) % len(dictionary) for x in hex_indeces]
  hash_words = [dictionary[x] for x in indeces]

  result = '-'.join(hash_words)
  return result

if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument(dest='input_word', action='store')
  parser.add_argument('-n', '--num-words', dest='num_words', type=int, default=4)
  args = parser.parse_args()
  result = hash_to_words(args.input_word, args.num_words, load_dictionary("word_list.txt"))
  print(result)
