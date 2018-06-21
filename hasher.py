import hashlib
import argparse
import textwrap

def max_int_from_string(string, max_val, current_value=''):
  if len(string) == 0:
    return int(current_value), string
  if int(current_value + string[-1]) > max_val:
    return int(current_value), string

  return max_int_from_string(string[:-1], max_val, current_value=current_value + string[-1])

def hash_to_words(input_word, num_words=3):
  dict_file = "word_list.txt"
  dictionary_words = []
  with open(dict_file, 'r') as infile:
    for line in infile:
      dictionary_words.append(line.rstrip("\n"))

  hex_digest = hashlib.sha1(str.encode(input_word)).hexdigest()
  int_digest = str(int(hex_digest, 16))
  indeces = textwrap.wrap(int_digest, len(int_digest) // num_words + 1)
  hash_words = [dictionary_words[int(x) % len(dictionary_words)] for x in indeces]

  # while len(hash_words) < num_words:
  #   word_num, int_digest = max_int_from_string(int_digest, len(dictionary_words) - 1)
  #   try:
  #     hash_words.append(dictionary_words[word_num])
  #   except:
  #     print(word_num)

  # import pdb; pdb.set_trace()
  result = '-'.join(hash_words)
  return result

if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument(dest='input_word', action='store')
  parser.add_argument('-n', '--num-words', dest='num_words', type=int, default=3)
  args = parser.parse_args()
  hash_to_words(args.input_word, args.num_words)
